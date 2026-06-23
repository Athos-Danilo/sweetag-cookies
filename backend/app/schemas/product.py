from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ProductBase(BaseModel):
    name: str = Field(..., description="Nome temático de psicologia")
    description: Optional[str] = Field(None, description="Descrição temática")
    history_branding: Optional[str] = Field(None, description="História/Branding temático")
    ingredients: Optional[str] = Field(None, description="Ingredientes do cookie")
    nutritional_table: Optional[Dict[str, Any]] = Field(None, description="Tabela nutricional flexível")
    image_url: Optional[str] = Field(None, description="URL da imagem")
    price: float = Field(..., description="Preço do cookie")
    stock_quantity: int = Field(0, description="Quantidade em estoque")
    daily_availability: bool = Field(True, description="Disponibilidade diária")
    is_active: bool = Field(True, description="Indica se o cookie está ativo (soft delete)")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    history_branding: Optional[str] = None
    ingredients: Optional[str] = None
    nutritional_table: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    daily_availability: Optional[bool] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

class ProductStockUpdate(BaseModel):
    stock_quantity: int = Field(..., ge=0, description="Nova quantidade em estoque")
