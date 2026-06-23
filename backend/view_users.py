import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import Base
from app.models.user import User

# Load DATABASE_URL from .env
def get_env_db_url():
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                if line.strip().startswith("DATABASE_URL="):
                    return line.strip().split("=", 1)[1].strip("\"'")
    return "postgresql+asyncpg://postgres:8156@localhost:5432/sweetag_cookies"

async def main():
    db_url = get_env_db_url()
    print(f"Connecting to: {db_url}")
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        print("\n--- Lista de Usuários no Banco ---")
        for u in users:
            print(f"ID: {u.id} | Nome: {u.nome} | Whatsapp: {u.whatsapp} | Admin: {u.is_admin}")
        print("---------------------------------")

if __name__ == "__main__":
    asyncio.run(main())
