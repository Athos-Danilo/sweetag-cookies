from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.models.support import SupportTicket
from app.schemas.support import SupportTicketCreate, SupportTicketResponse

router = APIRouter(prefix="/api/support", tags=["support"])

@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_data: SupportTicketCreate, 
    db: AsyncSession = Depends(get_db)
):
    try:
        new_ticket = SupportTicket(
            category=ticket_data.category,
            order_id=ticket_data.orderId,
            message=ticket_data.message,
            user_id=None # Para implementação futura de usuário logado, pode pegar do token
        )
        
        db.add(new_ticket)
        await db.commit()
        await db.refresh(new_ticket)
        
        return new_ticket
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar o chamado de suporte."
        )
