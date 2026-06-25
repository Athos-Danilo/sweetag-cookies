from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse
from app.core.cache import products_cache

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=List[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    """
    Endpoint público para listar todos os cookies ativos (is_active=True)
    """
    # 1. Tentar ler do cache em memória
    cached = await products_cache.get()
    if cached is not None:
        return cached

    # 2. Se não estiver em cache, buscar do banco
    result = await db.execute(
        select(Product)
        .where(Product.is_active == True)
        .order_by(Product.id.asc())
    )
    products = result.scalars().all()
    
    # 3. Serializar dados para evitar problemas de session desanexada (detached session)
    serialized_products = [ProductResponse.model_validate(p).model_dump() for p in products]
    
    # 4. Salvar no cache por 5 minutos (300 segundos)
    await products_cache.set(serialized_products, ttl_seconds=300)
    
    return serialized_products

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


# --- Endpoints Protegidos (Admin) ---

from app.api.deps import get_current_admin_user
from app.schemas.product import ProductCreate, ProductUpdate, ProductStockUpdate
from app.models.user import User


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Endpoint exclusivo para admin. Cria um novo sabor temático de cookie.
    """
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    # Invalidar o cache após criação
    await products_cache.clear()
    return db_product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Endpoint exclusivo para admin. Atualiza os dados completos do cookie.
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cookie não encontrado"
        )
        
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
        
    await db.commit()
    await db.refresh(product)
    # Invalidar o cache após atualização
    await products_cache.clear()
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Endpoint exclusivo para admin. Desativação lógica do cookie (Soft Delete).
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cookie não encontrado"
        )
        
    product.is_active = False
    await db.commit()
    # Invalidar o cache após soft delete
    await products_cache.clear()
    return None


@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def update_product_stock(
    product_id: int,
    stock_in: ProductStockUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Endpoint exclusivo para admin. Ajuste rápido de estoque.
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cookie não encontrado"
        )
        
    product.stock_quantity = stock_in.stock_quantity
    await db.commit()
    await db.refresh(product)
    # Invalidar o cache após ajuste de estoque
    await products_cache.clear()
    return product
