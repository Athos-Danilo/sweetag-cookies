from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.campaign import CampaignState
from app.schemas.campaign import CampaignResponse, CampaignUpdate
from app.api.deps import get_current_admin_user
from app.models.user import User

router = APIRouter(tags=["campaign"])

@router.get("/api/campaign", response_model=CampaignResponse)
async def get_campaign(db: AsyncSession = Depends(get_db)):
    """
    Endpoint público para obter o estado atual da campanha.
    Retorna um registro padrão caso nenhum esteja cadastrado.
    """
    result = await db.execute(select(CampaignState).order_by(CampaignState.id.asc()))
    campaign = result.scalars().first()
    if not campaign:
        campaign = CampaignState(
            total_goal=0.00,
            current_arrecadado=0.00,
            motivational_text="Ajude-nos a alcançar a nossa meta!",
            show_publicly=True
        )
        db.add(campaign)
        await db.commit()
        await db.refresh(campaign)
    return campaign

@router.put("/api/admin/campaign", response_model=CampaignResponse)
async def update_campaign(
    campaign_in: CampaignUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Endpoint exclusivo para admin para gerenciar os dados da campanha.
    """
    result = await db.execute(select(CampaignState).order_by(CampaignState.id.asc()))
    campaign = result.scalars().first()
    
    if not campaign:
        campaign = CampaignState(
            total_goal=0.00,
            current_arrecadado=0.00,
            motivational_text="Ajude-nos a alcançar a nossa meta!",
            show_publicly=True
        )
        db.add(campaign)
        
    update_data = campaign_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
        
    await db.commit()
    await db.refresh(campaign)
    return campaign
