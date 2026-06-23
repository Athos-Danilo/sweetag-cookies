from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.campaign import CampaignState
from app.schemas.campaign import CampaignResponse, CampaignUpdate
from app.api.deps import get_current_admin_user
from app.models.user import User

router = APIRouter(tags=["campaign"])

@router.get("/api/campaign", response_model=CampaignResponse)
async def get_campaign(db: AsyncSession = Depends(get_db)):
    """
    Endpoint público para obter o estado atual da campanha.
    Retorna um registro padrão caso nenhum esteja cadastrado.
    """
    result = await db.execute(select(CampaignState).order_by(CampaignState.id.asc()))
    campaign = result.scalars().first()
    if not campaign:
        campaign = CampaignState(
            total_goal=0.00,
            current_arrecadado=0.00,
            motivational_text="Ajude-nos a alcançar a nossa meta!",
            show_publicly=True
        )
        db.add(campaign)
        await db.commit()
        await db.refresh(campaign)
    return campaign

@router.put("/api/admin/campaign", response_model=CampaignResponse)
async def update_campaign(
    campaign_in: CampaignUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Endpoint exclusivo para admin para gerenciar os dados da campanha.
    """
    result = await db.execute(select(CampaignState).order_by(CampaignState.id.asc()))
    campaign = result.scalars().first()
    
    if not campaign:
        campaign = CampaignState(
            total_goal=0.00,
            current_arrecadado=0.00,
            motivational_text="Ajude-nos a alcançar a nossa meta!",
            show_publicly=True
        )
        db.add(campaign)
        
    update_data = campaign_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
        
    await db.commit()
    await db.refresh(campaign)
    return campaign


from sqlalchemy import func
from app.models.order import Order, OrderItem
from app.schemas.report import TopCookieResponse
from typing import List

@router.get("/api/admin/reports/top-cookies", response_model=List[TopCookieResponse])
async def get_top_cookies(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Retorna os 5 cookies mais vendidos (por quantidade total vendida)
    para pedidos pagos ou confirmados (status_step >= 2).
    """
    stmt = (
        select(
            OrderItem.product_id,
            OrderItem.name,
            func.sum(OrderItem.quantity).label("total_quantity"),
            func.sum(OrderItem.quantity * OrderItem.price).label("total_revenue")
        )
        .join(Order, OrderItem.order_id == Order.id)
        .where(Order.status_step >= 2)
        .group_by(OrderItem.product_id, OrderItem.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    top_cookies = []
    for row in rows:
        top_cookies.append(
            TopCookieResponse(
                product_id=row.product_id,
                name=row.name,
                total_quantity=row.total_quantity,
                total_revenue=float(row.total_revenue)
            )
        )
        
    return top_cookies
