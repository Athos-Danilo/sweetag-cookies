from pydantic import BaseModel
from typing import Optional

class TopCookieResponse(BaseModel):
    product_id: Optional[int]
    name: str
    total_quantity: int
    total_revenue: float

    class Config:
        from_attributes = True
