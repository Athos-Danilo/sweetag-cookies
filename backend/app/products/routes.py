from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=List[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    """
    Endpoint público para listar todos os cookies ativos (is_active=True)
    """
    result = await db.execute(
        select(Product)
        .where(Product.is_active == True)
        .order_by(Product.id.asc())
    )
    products = result.scalars().all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    Endpoint público para retornar os detalhes de um cookie específico pelo ID
    """
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id, Product.is_active == True)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cookie não encontrado ou inativo"
        )
    return product
