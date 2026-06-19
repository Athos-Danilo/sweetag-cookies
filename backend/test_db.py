import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    try:
        engine = create_async_engine("postgresql+asyncpg://postgres:projectcookiesag@localhost:5432/meu_projeto_dev")
        async with engine.connect() as conn:
            print("Connected successfully!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
