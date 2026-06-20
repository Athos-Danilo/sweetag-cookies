from pydantic import BaseModel, Field
from typing import Optional

class AddressBase(BaseModel):
    title: str = Field(..., description="Título do endereço (ex: Casa, Clínica)")
    department: Optional[str] = None
    block: Optional[str] = None
    room: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    neighborhood: Optional[str] = None
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

