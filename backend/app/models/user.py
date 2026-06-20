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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    push_subscriptions = relationship("PushSubscription", back_populates="user", cascade="all, delete-orphan")
