import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.push_subscription import PushSubscription
from app.websockets.manager import manager
from pywebpush import webpush, WebPushException
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def notify_user(db: AsyncSession, user_id: int, message: str, data: dict = None):
    payload = {
        "notification": {
            "title": "SweetAg Cookies",
            "body": message,
            "icon": "/assets/icons/icon-192x192.png",
            "vibrate": [100, 50, 100],
            "data": data or {"dateOfArrival": "now"}
        }
    }
    
    # 1. Try WebSocket first
    success_ws = await manager.send_personal_message({"message": message, "data": data}, user_id)
    if success_ws:
        logger.info(f"Notification sent to user {user_id} via WebSocket.")
        # If we only want to send push when the user is disconnected, we can return here.
        # But generally, Web Push handles it properly in background, or we can send to both.
    
    # 2. Try VAPID Push (Background)
    result = await db.execute(select(PushSubscription).where(PushSubscription.user_id == user_id))
    subscriptions = result.scalars().all()
    
    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth
                    }
                },
                data=json.dumps(payload),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": settings.VAPID_CLAIM_EMAIL
                }
            )
            logger.info(f"VAPID push sent to user {user_id}")
        except WebPushException as ex:
            logger.error(f"WebPushException for user {user_id}: {ex}")
            # If subscription is invalid (e.g. 410 Gone), remove it
            if ex.response is not None and ex.response.status_code in [404, 410]:
                await db.delete(sub)
                await db.commit()
                logger.info(f"Removed invalid subscription for user {user_id}")
