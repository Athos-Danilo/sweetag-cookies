from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse
from app.core.security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    whatsapp_clean = request.whatsapp.strip()

    result = await db.execute(select(User).where(User.whatsapp == whatsapp_clean))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado. Por favor, cadastre-se.")

    access_token = create_access_token(data={"sub": str(user.id), "whatsapp": user.whatsapp})

    return AuthResponse(
        access_token=access_token,
        user=user
    )

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    whatsapp_clean = request.whatsapp.strip()

    result = await db.execute(select(User).where(User.whatsapp == whatsapp_clean))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário já cadastrado. Por favor, faça login.")

    user = User(
        whatsapp=whatsapp_clean,
        nome=request.nome.strip(),
        aceita_notificacoes=request.aceitaNotificacoes
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "whatsapp": user.whatsapp})

    return AuthResponse(
        access_token=access_token,
        user=user
    )
