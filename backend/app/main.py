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
from app.models.product import Product
from app.models.campaign import CampaignState


app = FastAPI(
    title="SweetAg Cookies API",
    description="Backend API for SweetAg Cookies platform - Theme: Psychology Cookies",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.websockets.routes import router as websockets_router
from app.notifications.routes import router as notifications_router
from app.favorites.routes import router as favorites_router
from app.products.routes import router as products_router
from app.reports.routes import router as reports_router
from app.api.admin.orders import router as admin_orders_router

# Include Routers
app.include_router(auth_router)
app.include_router(support_router)
app.include_router(addresses_router)
app.include_router(orders_router)
app.include_router(websockets_router)
app.include_router(notifications_router)
app.include_router(favorites_router)
app.include_router(products_router)
app.include_router(reports_router)
app.include_router(admin_orders_router)


from app.services.expiration_worker import start_expiration_worker

@app.on_event("startup")
async def startup():
    # Initialize DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start periodic worker to expire unpaid orders
    start_expiration_worker()


@app.get("/")
def read_root():
    return {
        "status": "active",
        "project": "SweetAg Cookies",
        "slogan": "Alimente sua mente. E sua fome. 🧠🍪"
    }
