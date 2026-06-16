from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routes import router as auth_router
from app.core.database import engine, Base

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

# Include Routers
app.include_router(auth_router)

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
