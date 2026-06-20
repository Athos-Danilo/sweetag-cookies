from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.push_subscription import PushSubscription
from app.notifications.schemas import PushSubscriptionCreate

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
async def subscribe_to_push(
    subscription_data: PushSubscriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if subscription already exists
    result = await db.execute(
        select(PushSubscription).where(
            (PushSubscription.endpoint == subscription_data.endpoint) &
            (PushSubscription.user_id == current_user.id)
        )
    )
    existing_sub = result.scalars().first()

    if existing_sub:
        # Update existing
        existing_sub.p256dh = subscription_data.keys.p256dh
        existing_sub.auth = subscription_data.keys.auth
    else:
        # Create new
        new_sub = PushSubscription(
            user_id=current_user.id,
            endpoint=subscription_data.endpoint,
            p256dh=subscription_data.keys.p256dh,
            auth=subscription_data.keys.auth
        )
        db.add(new_sub)

    # Ensure user has notifications enabled
    if not current_user.aceita_notificacoes:
        current_user.aceita_notificacoes = True

    await db.commit()
    return {"message": "Subscription saved"}
