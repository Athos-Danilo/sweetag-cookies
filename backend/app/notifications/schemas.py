from pydantic import BaseModel
from typing import Optional

class PushKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    expirationTime: Optional[int] = None
    keys: PushKeys
