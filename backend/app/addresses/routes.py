from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressResponse

router = APIRouter(prefix="/api/addresses", tags=["addresses"])

@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    address_in: AddressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if this is the first address, make it default if so
    result = await db.execute(select(Address).where(Address.user_id == current_user.id))
    existing_addresses = result.scalars().all()
    
    is_default = address_in.is_default
    if not existing_addresses:
        is_default = True
    elif is_default:
        # Update other addresses to not be default
        for addr in existing_addresses:
            if addr.is_default:
                addr.is_default = False
                db.add(addr)
    
    db_address = Address(
        user_id=current_user.id,
        title=address_in.title,
        department=address_in.department,
        block=address_in.block,
        room=address_in.room,
        street=address_in.street,
        number=address_in.number,
        neighborhood=address_in.neighborhood,
        is_default=is_default
    )
    
    db.add(db_address)
    await db.commit()
    await db.refresh(db_address)
    
    return db_address

@router.get("", response_model=List[AddressResponse])
async def read_addresses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Address).where(Address.user_id == current_user.id))
    addresses = result.scalars().all()
    return addresses
