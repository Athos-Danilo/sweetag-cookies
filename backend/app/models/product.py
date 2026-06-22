from sqlalchemy import Column, Integer, String, Text, Float, Boolean, JSON
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    history_branding = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)
    nutritional_table = Column(JSON, nullable=True)
    image_url = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    daily_availability = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
