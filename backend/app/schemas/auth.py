from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuthRequest(BaseModel):
    whatsapp: str
    nome: str
    aceitaNotificacoes: bool = False

class UserResponse(BaseModel):
    id: int
    whatsapp: str
    nome: str
    aceita_notificacoes: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
