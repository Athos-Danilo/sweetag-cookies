import asyncio
from datetime import date, timedelta
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.availability import Availability
from app.models.product import Product

async def main():
    async with AsyncSessionLocal() as session:
        # Find Product 1 (Cookie Lacan)
        result = await session.execute(select(Product).where(Product.id == 1))
        prod = result.scalars().first()
        if not prod:
            print("Product ID 1 not found! Seed products first.")
            return

        tomorrow = date.today() + timedelta(days=1)
        # Check if already exists
        result_avail = await session.execute(
            select(Availability).where(Availability.date == tomorrow, Availability.product_id == prod.id)
        )
        avail = result_avail.scalars().first()
        if not avail:
            new_avail = Availability(
                date=tomorrow,
                product_id=prod.id,
                max_quantity_allowed=10
            )
            session.add(new_avail)
            print(f"Availability registered for {tomorrow} with limit 10.")
        else:
            avail.max_quantity_allowed = 10
            print(f"Availability updated for {tomorrow} with limit 10.")
        await session.commit()

if __name__ == "__main__":
    asyncio.run(main())
