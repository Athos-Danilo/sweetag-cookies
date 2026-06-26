from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    whatsapp = Column(String, unique=True, index=True, nullable=False)
    nome = Column(String, nullable=False)
    aceita_notificacoes = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_superadmin = Column(Boolean, default=False, server_default="false")
    hashed_password = Column(String, nullable=True)
    recovery_codes = Column(String, nullable=True) # Armazenaremos como string JSON no banco
    admin_creation_password = Column(String, nullable=True) # Senha específica opcional para cadastrar novos admins
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    push_subscriptions = relationship("PushSubscription", back_populates="user", cascade="all, delete-orphan")
