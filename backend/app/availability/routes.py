from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from typing import List
from datetime import date

from app.core.database import get_db
from app.models.availability import Availability
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.availability import CalendarDayAvailability

router = APIRouter(prefix="/api/availability", tags=["availability"])

@router.get("/calendar", response_model=List[CalendarDayAvailability])
async def get_calendar_availability(db: AsyncSession = Depends(get_db)):
    # 1. Buscar todas as disponibilidades cadastradas e seus respectivos produtos
    stmt = select(Availability, Product).join(Product, Availability.product_id == Product.id).order_by(Availability.date.asc())
    result = await db.execute(stmt)
    rows = result.all()
    
    calendar = []
    for avail, prod in rows:
        # 2. Calcular a quantidade já agendada para esse produto na data específica
        stmt_ordered = (
            select(func.sum(OrderItem.quantity))
            .join(Order)
            .where(
                Order.scheduled_date == avail.date,
                OrderItem.product_id == avail.product_id,
                Order.status.notin_(["EXPIRADO", "RESERVA_REJEITADA"])
            )
        )
        ordered_result = await db.execute(stmt_ordered)
        quantity_ordered = ordered_result.scalar() or 0
        
        # 3. Calcular quantidade restante
        quantity_remaining = max(0, avail.max_quantity_allowed - quantity_ordered)
        
        calendar.append(CalendarDayAvailability(
            date=avail.date,
            product_id=avail.product_id,
            product_name=prod.name,
            max_quantity_allowed=avail.max_quantity_allowed,
            quantity_ordered=quantity_ordered,
            quantity_remaining=quantity_remaining
        ))
        
    return calendar
