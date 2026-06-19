from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.address import AddressResponse

class OrderItemBase(BaseModel):
    name: str
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    address_id: int
    total: float
    payment_method: str

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderResponse(OrderBase):
    id: int
    user_id: int
    status: str
    status_step: int
    created_at: datetime
    items: List[OrderItemResponse]
    address: AddressResponse

    class Config:
        from_attributes = True
