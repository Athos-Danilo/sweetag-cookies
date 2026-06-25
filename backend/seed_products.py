import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.product import Product

async def main():
    async with AsyncSessionLocal() as session:
        # Check if they exist
        for name, price in [("Cookie Lacan", 10.0), ("Cookie Freud", 10.0), ('Cookie "Freud Supremo"', 8.0), ('Cookie "Jean Piaget"', 9.5)]:
            result = await session.execute(select(Product).where(Product.name == name))
            product = result.scalars().first()
            if not product:
                new_p = Product(
                    name=name,
                    description=f"Delicioso cookie temático de {name}.",
                    price=price,
                    stock_quantity=50,
                    daily_availability=True,
                    is_active=True
                )
                session.add(new_p)
                print(f"Added product: {name}")
            else:
                product.stock_quantity = 50
                product.is_active = True
                product.daily_availability = True
                print(f"Updated stock for product: {name}")
        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(main())
