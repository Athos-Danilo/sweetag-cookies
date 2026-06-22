from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routes import router as auth_router
from app.support.routes import router as support_router
from app.addresses.routes import router as addresses_router
from app.orders.routes import router as orders_router
from app.core.database import engine, Base
from app.models.user import User
from app.models.support import SupportTicket
from app.models.address import Address
from app.models.order import Order, OrderItem
from app.models.favorite import Favorite

app = FastAPI(
    title="SweetAg Cookies API",
    description="Backend API for SweetAg Cookies platform - Theme: Psychology Cookies",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.websockets.routes import router as websockets_router
from app.notifications.routes import router as notifications_router
from app.favorites.routes import router as favorites_router

# Include Routers
app.include_router(auth_router)
app.include_router(support_router)
app.include_router(addresses_router)
app.include_router(orders_router)
app.include_router(websockets_router)
app.include_router(notifications_router)
app.include_router(favorites_router)

@app.on_event("startup")
async def startup():
    # Initialize DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {
        "status": "active",
        "project": "SweetAg Cookies",
        "slogan": "Alimente sua mente. E sua fome. 🧠🍪"
    }
