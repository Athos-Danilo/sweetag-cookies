from pydantic import BaseModel, Field
from typing import Optional

class CampaignBase(BaseModel):
    total_goal: float = Field(..., description="Meta total em reais")
    current_arrecadado: float = Field(..., description="Valor atual arrecadado em reais")
    motivational_text: Optional[str] = Field(None, description="Texto motivacional da campanha")
    show_publicly: bool = Field(True, description="Mostrar valores publicamente")

class CampaignUpdate(BaseModel):
    total_goal: Optional[float] = None
    current_arrecadado: Optional[float] = None
    motivational_text: Optional[str] = None
    show_publicly: Optional[bool] = None

class CampaignResponse(CampaignBase):
    id: int

    class Config:
        from_attributes = True
