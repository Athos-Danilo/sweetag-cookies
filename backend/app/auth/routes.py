from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest, RegisterRequest, AuthResponse,
    AdminLoginRequest, AdminRegisterRequest, AdminRegisterResponse,
    PasswordRecoveryRequest, PasswordRecoveryResponse,
    VerifySuperPasswordRequest, VerifySuperPasswordResponse, UserResponse
)
from app.core.security import create_access_token, verify_password, get_password_hash, generate_recovery_code
from app.core.limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def login(request: Request, login_req: LoginRequest, db: AsyncSession = Depends(get_db)):
    whatsapp_clean = login_req.whatsapp.strip()

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
@limiter.limit("5/minute")
async def register(request: Request, register_req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    whatsapp_clean = register_req.whatsapp.strip()

    result = await db.execute(select(User).where(User.whatsapp == whatsapp_clean))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário já cadastrado. Por favor, faça login.")

    user = User(
        whatsapp=whatsapp_clean,
        nome=register_req.nome.strip(),
        aceita_notificacoes=register_req.aceitaNotificacoes
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "whatsapp": user.whatsapp})

    return AuthResponse(
        access_token=access_token,
        user=user
    )

@router.post("/admin/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def admin_login(request: Request, login_req: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    whatsapp_clean = login_req.whatsapp.strip()

    result = await db.execute(select(User).where(User.whatsapp == whatsapp_clean))
    user = result.scalars().first()

    if not user or not user.is_admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Administrador não encontrado.")

    if not user.hashed_password or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais incorretas.")

    access_token = create_access_token(data={"sub": str(user.id), "whatsapp": user.whatsapp})

    return AuthResponse(
        access_token=access_token,
        user=user
    )

@router.post("/admin/verify-super-password", response_model=VerifySuperPasswordResponse)
async def verify_super_password(request: Request, verify_req: VerifySuperPasswordRequest, db: AsyncSession = Depends(get_db)):
    # Busca qualquer superadmin
    result = await db.execute(select(User).where(User.is_superadmin == True))
    superadmins = result.scalars().all()

    # Se não houver nenhum superadmin ainda, a senha é sempre válida (fase bootstrap)
    if not superadmins:
        return VerifySuperPasswordResponse(valid=True)

    # Verifica se a senha bate com a senha de login do superadmin ou com a de convite
    for sa in superadmins:
        if sa.hashed_password and verify_password(verify_req.superadmin_password, sa.hashed_password):
            return VerifySuperPasswordResponse(valid=True)
        if sa.admin_creation_password and verify_password(verify_req.superadmin_password, sa.admin_creation_password):
            return VerifySuperPasswordResponse(valid=True)

    return VerifySuperPasswordResponse(valid=False)

@router.post("/admin/register", response_model=AdminRegisterResponse)
@limiter.limit("5/minute")
async def admin_register(request: Request, register_req: AdminRegisterRequest, db: AsyncSession = Depends(get_db)):
    whatsapp_clean = register_req.whatsapp.strip()

    # Verifica se já existe usuário
    result = await db.execute(select(User).where(User.whatsapp == whatsapp_clean))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WhatsApp já cadastrado.")

    # Verifica se já existe algum superadmin
    result_sa = await db.execute(select(User).where(User.is_superadmin == True))
    superadmins = result_sa.scalars().all()

    is_first_admin = len(superadmins) == 0

    if not is_first_admin:
        # Precisamos validar a senha do SuperAdmin supremo
        if not register_req.superadmin_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A senha do Administrador Supremo é obrigatória para criar novos administradores."
            )

        valid_super_pwd = False
        for sa in superadmins:
            if sa.hashed_password and verify_password(register_req.superadmin_password, sa.hashed_password):
                valid_super_pwd = True
                break
            if sa.admin_creation_password and verify_password(register_req.superadmin_password, sa.admin_creation_password):
                valid_super_pwd = True
                break

        if not valid_super_pwd:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Senha do Administrador Supremo incorreta."
            )

    # Gera 5 códigos de recuperação
    recovery_codes_raw = [generate_recovery_code() for _ in range(5)]
    recovery_codes_hashed = [get_password_hash(code) for code in recovery_codes_raw]

    # Cria o novo usuário admin
    new_admin = User(
        whatsapp=whatsapp_clean,
        nome=register_req.nome.strip(),
        is_admin=True,
        is_superadmin=is_first_admin, # Vira superadmin se for o primeiro
        hashed_password=get_password_hash(register_req.password),
        recovery_codes=json.dumps(recovery_codes_hashed)
    )

    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)

    access_token = create_access_token(data={"sub": str(new_admin.id), "whatsapp": new_admin.whatsapp})

    return AdminRegisterResponse(
        access_token=access_token,
        user=new_admin,
        recovery_codes=recovery_codes_raw
    )

@router.post("/admin/recover", response_model=PasswordRecoveryResponse)
@limiter.limit("5/minute")
async def admin_recover(request: Request, recover_req: PasswordRecoveryRequest, db: AsyncSession = Depends(get_db)):
    whatsapp_clean = recover_req.whatsapp.strip()

    result = await db.execute(select(User).where(User.whatsapp == whatsapp_clean))
    user = result.scalars().first()

    if not user or not user.is_admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Administrador não encontrado.")

    if not user.recovery_codes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esse administrador não possui códigos de recuperação configurados."
        )

    recovery_codes_hashed = json.loads(user.recovery_codes)

    matched_index = -1
    for idx, code_hash in enumerate(recovery_codes_hashed):
        if verify_password(recover_req.recovery_code.strip(), code_hash):
            matched_index = idx
            break

    if matched_index == -1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de recuperação inválido."
        )

    # Remove o código usado
    recovery_codes_hashed.pop(matched_index)

    # Gera um novo código para manter 5 códigos ativos
    new_code_raw = generate_recovery_code()
    new_code_hash = get_password_hash(new_code_raw)
    recovery_codes_hashed.append(new_code_hash)

    # Atualiza no usuário
    user.recovery_codes = json.dumps(recovery_codes_hashed)
    user.hashed_password = get_password_hash(recover_req.new_password)

    db.add(user)
    await db.commit()

    return PasswordRecoveryResponse(
        success=True,
        message="Senha atualizada com sucesso.",
        new_recovery_code=new_code_raw
    )

