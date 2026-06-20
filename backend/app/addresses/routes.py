from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressResponse, AddressUpdate

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

@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: int,
    address_in: AddressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify address exists and belongs to user
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == current_user.id)
    )
    db_address = result.scalars().first()
    
    if not db_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Endereço não encontrado ou não pertence ao usuário."
        )
    
    is_default = address_in.is_default
    
    # Se o novo valor for padrão, atualizamos os outros para não serem padrão
    if is_default and not db_address.is_default:
        result = await db.execute(
            select(Address).where(Address.user_id == current_user.id, Address.id != address_id)
        )
        other_addresses = result.scalars().all()
        for addr in other_addresses:
            if addr.is_default:
                addr.is_default = False
                db.add(addr)
    # Se o usuário tentar desmarcar como padrão, mas for o único endereço dele, mantemos True
    elif not is_default and db_address.is_default:
        result = await db.execute(
            select(Address).where(Address.user_id == current_user.id, Address.id != address_id)
        )
        other_addresses = result.scalars().all()
        if not other_addresses:
            is_default = True

    # Atualiza campos
    db_address.title = address_in.title
    db_address.department = address_in.department
    db_address.block = address_in.block
    db_address.room = address_in.room
    db_address.street = address_in.street
    db_address.number = address_in.number
    db_address.neighborhood = address_in.neighborhood
    db_address.is_default = is_default

    db.add(db_address)
    await db.commit()
    await db.refresh(db_address)
    return db_address

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify address exists and belongs to user
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == current_user.id)
    )
    db_address = result.scalars().first()
    
    if not db_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Endereço não encontrado ou não pertence ao usuário."
        )
    
    was_default = db_address.is_default
    
    await db.delete(db_address)
    await db.commit()
    
    # Se deletamos o endereço padrão, precisamos promover outro como padrão
    if was_default:
        result = await db.execute(
            select(Address).where(Address.user_id == current_user.id)
        )
        remaining_addresses = result.scalars().all()
        if remaining_addresses:
            remaining_addresses[0].is_default = True
            db.add(remaining_addresses[0])
            await db.commit()
            
    return None

@router.patch("/{address_id}/default", response_model=AddressResponse)
async def set_default_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify address exists and belongs to user
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == current_user.id)
    )
    db_address = result.scalars().first()
    
    if not db_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Endereço não encontrado ou não pertence ao usuário."
        )
        
    if not db_address.is_default:
        # Desativa os outros endereços padrões do mesmo usuário
        result = await db.execute(
            select(Address).where(Address.user_id == current_user.id, Address.id != address_id)
        )
        other_addresses = result.scalars().all()
        for addr in other_addresses:
            if addr.is_default:
                addr.is_default = False
                db.add(addr)
                
        db_address.is_default = True
        db.add(db_address)
        await db.commit()
        await db.refresh(db_address)
        
    return db_address
