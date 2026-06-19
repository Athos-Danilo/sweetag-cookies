from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SupportTicketCreate(BaseModel):
    category: str = Field(..., description="Categoria do chamado")
    orderId: Optional[str] = Field(None, description="Número do pedido opcional")
    message: str = Field(..., min_length=10, description="Mensagem do usuário")

class SupportTicketResponse(BaseModel):
    id: int
    category: str
    order_id: Optional[str]
    message: str
    user_id: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
