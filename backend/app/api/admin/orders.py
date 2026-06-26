from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_admin_user
from app.models.user import User
from app.models.order import Order
from app.models.campaign import CampaignState
from app.schemas.order import AdminOrderResponse, AdminOrderStatusUpdate, ReviewScheduleRequest
from app.notifications.services import notify_user

router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])

@router.get("", response_model=List[AdminOrderResponse])
async def list_admin_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Retorna a listagem de todos os pedidos do sistema (com filtros opcionais por status),
    trazendo os dados do usuário, itens e endereço interno de entrega.
    """
    stmt = select(Order).options(
        selectinload(Order.items),
        selectinload(Order.address),
        selectinload(Order.user)
    )
    
    if status_filter:
        stmt = stmt.where(Order.status == status_filter)
        
    stmt = stmt.order_by(Order.created_at.desc())
    result = await db.execute(stmt)
    orders = result.scalars().all()
    return orders

@router.patch("/{order_id}/status", response_model=AdminOrderResponse)
async def update_order_status_admin(
    order_id: int,
    status_in: AdminOrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Alteração manual do status do pedido com regra de negócio para não retroceder (RN05).
    """
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.address), selectinload(Order.user))
        .where(Order.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado."
        )
        
    # RN05: O status nunca pode retroceder
    if status_in.status_step < order.status_step:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"O status do pedido não pode retroceder. Status atual: '{order.status}' (Etapa {order.status_step})."
        )
        
    order.status = status_in.status
    order.status_step = status_in.status_step
    
    await db.commit()
    await db.refresh(order)
    
    # Notificar o usuário
    try:
        await notify_user(
            db, 
            order.user_id, 
            f"Seu pedido mudou para: {status_in.status}", 
            {"order_id": order.id, "status_step": status_in.status_step}
        )
    except Exception:
        # Silencia erro de notificação para não falhar a transação principal
        pass
        
    return order

@router.post("/{order_id}/approve-pix", response_model=AdminOrderResponse)
async def approve_order_pix(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Confirmação manual de pagamento Pix.
    Muda o status para 'Confirmado' e soma o total do pedido ao CampaignState (RN10).
    """
    # Usando transação ACID
    async with db.begin_nested():
        result = await db.execute(
            select(Order)
            .options(selectinload(Order.items), selectinload(Order.address), selectinload(Order.user))
            .where(Order.id == order_id)
            .with_for_update()
        )
        order = result.scalars().first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido não encontrado."
            )
            
        # Evitar aprovar duas vezes (double-counting do total da campanha)
        if order.status == "Confirmado" or order.status_step >= 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este pedido já foi confirmado ou pago."
            )
            
        # Atualiza status do pedido
        order.status = "Confirmado"
        order.status_step = 2
        
        # Busca e atualiza CampaignState
        campaign_result = await db.execute(
            select(CampaignState)
            .order_by(CampaignState.id.asc())
            .with_for_update()
        )
        campaign = campaign_result.scalars().first()
        
        if not campaign:
            campaign = CampaignState(
                total_goal=0.00,
                current_arrecadado=0.00,
                motivational_text="Ajude-nos a alcançar a nossa meta!",
                show_publicly=True
            )
            db.add(campaign)
            
        campaign.current_arrecadado = float(campaign.current_arrecadado) + order.total
        
    # Salva no banco de dados principal
    await db.commit()
    await db.refresh(order)
    
    # Notificar o usuário
    try:
        await notify_user(
            db, 
            order.user_id, 
            "Oba! Pagamento do seu pedido confirmado! 🧠🍪", 
            {"order_id": order.id, "status_step": 2}
        )
    except Exception:
        pass
        
    return order


@router.post("/{order_id}/review-schedule", response_model=AdminOrderResponse)
async def review_scheduled_order(
    order_id: int,
    payload: ReviewScheduleRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Avaliação de reservas futuras pelo administrador.
    - Se aprovado: muda status para 'AGENDADO_APROVADO'.
    - Se rejeitado: muda status para 'RESERVA_REJEITADA' (a cota é liberada ao não considerar este status no cálculo).
    """
    async with db.begin_nested():
        result = await db.execute(
            select(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.address),
                selectinload(Order.user)
            )
            .where(Order.id == order_id)
            .with_for_update()
        )
        order = result.scalars().first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido não encontrado."
            )
        
        if order.scheduled_date is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este pedido não é um agendamento / reserva futura."
            )
            
        if order.status != "RESERVA_ANALISE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Não é possível revisar uma reserva com status '{order.status}'. Deve estar em 'RESERVA_ANALISE'."
            )
            
        if payload.approved:
            order.status = "AGENDADO_APROVADO"
            order.status_step = 2
            notification_msg = "Sua reserva de cookie foi aprovada com sucesso! 📅🍪"
        else:
            order.status = "RESERVA_REJEITADA"
            order.status_step = 0
            notification_msg = "Sua reserva de cookie infelizmente foi rejeitada."
            if payload.justification:
                notification_msg += f" Motivo: {payload.justification}"
                
    await db.commit()
    await db.refresh(order)
    
    # Notificar o usuário via WebSocket
    try:
        await notify_user(
            db,
            order.user_id,
            notification_msg,
            {"order_id": order.id, "status": order.status, "status_step": order.status_step}
        )
    except Exception:
        pass
        
    return order

