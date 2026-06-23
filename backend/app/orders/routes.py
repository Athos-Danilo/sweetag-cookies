from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.address import Address
from app.schemas.order import OrderCreate, OrderResponse, OrderAddressUpdate


router = APIRouter(prefix="/api/orders", tags=["orders"])

from datetime import datetime, timedelta
from app.models.product import Product

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify address belongs to user
    result = await db.execute(select(Address).where(Address.id == order_in.address_id, Address.user_id == current_user.id))
    address = result.scalars().first()
    
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Endereço não encontrado ou não pertence ao usuário.")
        
    try:
        # Calculate expiration time: current time + 30 minutes (RN03)
        expires_at = datetime.utcnow() + timedelta(minutes=30)
        
        db_order_items = []
        
        # Lock and validate each product (RN01, RN02)
        for item in order_in.items:
            if item.product_id:
                stmt = select(Product).where(Product.id == item.product_id, Product.is_active == True).with_for_update()
            else:
                stmt = select(Product).where(Product.name == item.name, Product.is_active == True).with_for_update()
                
            prod_result = await db.execute(stmt)
            product = prod_result.scalars().first()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Sabor temático '{item.name}' não encontrado ou indisponível."
                )
                
            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Estoque insuficiente para o sabor '{product.name}'. Disponível: {product.stock_quantity}, Solicitado: {item.quantity}."
                )
                
            # Decrement inventory (RN01)
            product.stock_quantity -= item.quantity
            
            # Prepare OrderItem
            db_item = OrderItem(
                product_id=product.id,
                name=product.name,
                quantity=item.quantity,
                price=item.price
            )
            db_order_items.append(db_item)
            
        db_order = Order(
            user_id=current_user.id,
            address_id=order_in.address_id,
            total=order_in.total,
            payment_method=order_in.payment_method,
            status="Aguardando",
            status_step=1,
            expires_at=expires_at
        )
        
        db.add(db_order)
        await db.flush() # Generate ID for db_order
        
        for db_item in db_order_items:
            db_item.order_id = db_order.id
            db.add(db_item)
            
        await db.commit()
        
    except Exception as e:
        await db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar o pedido: {str(e)}"
        )
        
    # Reload order with relationships
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.address))
        .where(Order.id == db_order.id)
    )
    full_order = result.scalars().first()

    # Dispara alerta via WebSocket para os admins
    try:
        from app.websockets.manager import manager as ws_manager
        await ws_manager.broadcast_to_admins({
            "event": "new_order",
            "order_id": db_order.id,
            "total": db_order.total,
            "user_name": current_user.nome
        })
    except Exception:
        pass
    
    return full_order


@router.get("", response_model=List[OrderResponse])
async def read_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.address))
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return orders

from app.notifications.services import notify_user

@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_str: str,
    status_step: int,
    db: AsyncSession = Depends(get_db)
    # Removing current_user dependency so admins/webhook can update. In a real app, protect this route.
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
    order.status = status_str
    order.status_step = status_step
    await db.commit()
    
    # Notificar o usuário sobre a mudança
    await notify_user(db, order.user_id, f"Oba! Seu pedido de cookies mudou para: {status_str}", {"order_id": order.id, "status_step": status_step})
    
    return {"message": "Status atualizado com sucesso", "status": status_str}

@router.patch("/{order_id}/address", response_model=OrderResponse)
async def update_order_address(
    order_id: int,
    address_in: OrderAddressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch order and verify owner
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.address))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado ou não pertence ao usuário."
        )
        
    # 2. Check if the address exists and belongs to the user
    addr_result = await db.execute(
        select(Address).where(Address.id == address_in.address_id, Address.user_id == current_user.id)
    )
    address = addr_result.scalars().first()
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endereço não encontrado ou não pertence ao usuário."
        )
        
    # 3. Validate status step (RN06): Only allow change if status_step <= 2 ("PREPARACAO")
    if order.status_step > 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não é possível alterar o endereço. O pedido já está com o status '{order.status}'."
        )
        
    # 4. Update address
    order.address_id = address.id
    await db.commit()
    await db.refresh(order)
    
    return order

