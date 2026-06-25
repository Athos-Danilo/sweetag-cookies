from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.schemas.product import ProductResponse

class AvailabilityBase(BaseModel):
    date: date
    product_id: int
    max_quantity_allowed: int

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityResponse(AvailabilityBase):
    id: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class CalendarDayAvailability(BaseModel):
    date: date
    product_id: int
    product_name: str
    max_quantity_allowed: int
    quantity_ordered: int
    quantity_remaining: int
