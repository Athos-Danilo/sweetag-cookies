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
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["orders"])

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
        
    db_order = Order(
        user_id=current_user.id,
        address_id=order_in.address_id,
        total=order_in.total,
        payment_method=order_in.payment_method,
        status="Aguardando",
        status_step=1
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    
    for item in order_in.items:
        db_item = OrderItem(
            order_id=db_order.id,
            name=item.name,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
        
    await db.commit()
    
    # Reload order with relationships
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.address))
        .where(Order.id == db_order.id)
    )
    full_order = result.scalars().first()
    
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
