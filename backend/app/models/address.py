from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False) # e.g., "Clínica", "Casa"
    department = Column(String, nullable=True)
    block = Column(String, nullable=True)
    room = Column(String, nullable=True)
    street = Column(String, nullable=True)
    number = Column(String, nullable=True)
    neighborhood = Column(String, nullable=True)
    is_default = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", backref="addresses")
    # orders will be added as backref in Order model
