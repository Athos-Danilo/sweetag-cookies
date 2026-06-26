from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LoginRequest(BaseModel):
    whatsapp: str

class RegisterRequest(BaseModel):
    whatsapp: str
    nome: str
    aceitaNotificacoes: bool = False

class UserResponse(BaseModel):
    id: int
    whatsapp: str
    nome: str
    aceita_notificacoes: bool
    is_admin: bool
    is_superadmin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AdminLoginRequest(BaseModel):
    whatsapp: str
    password: str

class AdminRegisterRequest(BaseModel):
    whatsapp: str
    nome: str
    password: str
    superadmin_password: Optional[str] = None

class AdminRegisterResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    recovery_codes: List[str]

class PasswordRecoveryRequest(BaseModel):
    whatsapp: str
    recovery_code: str
    new_password: str

class PasswordRecoveryResponse(BaseModel):
    success: bool
    message: str
    new_recovery_code: str

class VerifySuperPasswordRequest(BaseModel):
    superadmin_password: str

class VerifySuperPasswordResponse(BaseModel):
    valid: bool
