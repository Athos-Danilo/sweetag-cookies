import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.product import Product

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Product))
        products = result.scalars().all()
        print(f"Total products in database: {len(products)}")
        for p in products:
            print(f"ID: {p.id} | Name: {p.name} | Price: {p.price} | Stock: {p.stock_quantity} | Active: {p.is_active} | Available today: {p.daily_availability}")

if __name__ == "__main__":
    asyncio.run(main())
