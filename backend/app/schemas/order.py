from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from app.schemas.address import AddressResponse

class OrderItemBase(BaseModel):
    product_id: Optional[int] = None
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

class OrderScheduleCreate(OrderCreate):
    scheduled_date: date

class OrderResponse(OrderBase):
    id: int
    user_id: int
    status: str
    status_step: int
    created_at: datetime
    items: List[OrderItemResponse]
    address: AddressResponse
    pix_code: Optional[str] = None
    expires_at: Optional[datetime] = None
    scheduled_date: Optional[date] = None

    class Config:
        from_attributes = True

class OrderAddressUpdate(BaseModel):
    address_id: int


from app.schemas.auth import UserResponse

class AdminOrderStatusUpdate(BaseModel):
    status: str
    status_step: int

class AdminOrderResponse(OrderResponse):
    user: UserResponse

