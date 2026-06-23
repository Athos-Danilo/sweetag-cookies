import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy.future import select

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.whatsapp == "(00) 00000-0001"))
        user = result.scalars().first()
        if user:
            user.is_admin = True
            session.add(user)
            print(f"✅ Usuário '{user.nome}' (ID: {user.id}) promovido a Administrador.")
        else:
            new_user = User(
                whatsapp="(00) 00000-0001",
                nome="Admin Teste",
                aceita_notificacoes=True,
                is_admin=True
            )
            session.add(new_user)
            print("✅ Novo usuário administrador 'Admin Teste' com whatsapp '(00) 00000-0001' criado.")
        await session.commit()

if __name__ == "__main__":
    asyncio.run(main())
