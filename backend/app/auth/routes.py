from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import AuthRequest, AuthResponse
from app.core.security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=AuthResponse)
async def login_or_register(request: AuthRequest, db: AsyncSession = Depends(get_db)):
    # Clean up phone number to remove formatting if needed (keep numbers only)
    # But since frontend sends formatted or raw, we'll just store what it sends for now
    whatsapp_clean = request.whatsapp.strip()

    # Find user by whatsapp
    result = await db.execute(select(User).where(User.whatsapp == whatsapp_clean))
    user = result.scalars().first()

    if not user:
        # Register new user
        user = User(
            whatsapp=whatsapp_clean,
            nome=request.nome.strip(),
            aceita_notificacoes=request.aceitaNotificacoes
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Generate JWT Token
    access_token = create_access_token(data={"sub": str(user.id), "whatsapp": user.whatsapp})

    return AuthResponse(
        access_token=access_token,
        user=user
    )
