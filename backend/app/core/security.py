from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
from passlib.context import CryptContext
import random
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def generate_recovery_code() -> str:
    # Retorna um código no formato SWT-XXXXXX com letras e números em maiúsculas
    chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"SWT-{chars}"
