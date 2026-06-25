import asyncio
from datetime import datetime, timedelta
from typing import Any, Optional

class ProductsCache:
    def __init__(self):
        self._data: Optional[Any] = None
        self._expires_at: Optional[datetime] = None
        self._lock = asyncio.Lock()

    async def get(self) -> Optional[Any]:
        async with self._lock:
            if self._expires_at and datetime.utcnow() < self._expires_at:
                return self._data
            # Cache expired or not set
            self._data = None
            self._expires_at = None
            return None

    async def set(self, data: Any, ttl_seconds: int = 300):
        async with self._lock:
            self._data = data
            self._expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)

    async def clear(self):
        async with self._lock:
            self._data = None
            self._expires_at = None

products_cache = ProductsCache()
