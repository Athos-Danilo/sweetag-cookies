from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.favorite import Favorite
from app.favorites.schemas import FavoriteResponse, FavoriteCreate

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_in: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if already favorited
    stmt = select(Favorite).where(
        Favorite.user_id == current_user.id,
        Favorite.product_id == favorite_in.product_id
    )
    result = await db.execute(stmt)
    existing_favorite = result.scalars().first()
    
    if existing_favorite:
        return existing_favorite
        
    new_favorite = Favorite(
        user_id=current_user.id,
        product_id=favorite_in.product_id
    )
    db.add(new_favorite)
    await db.commit()
    await db.refresh(new_favorite)
    return new_favorite

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Favorite).where(
        Favorite.user_id == current_user.id,
        Favorite.product_id == product_id
    )
    result = await db.execute(stmt)
    favorite = result.scalars().first()
    
    if favorite:
        await db.delete(favorite)
        await db.commit()
        
    return None

@router.get("", response_model=List[str])
async def list_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Favorite.product_id).where(Favorite.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()
