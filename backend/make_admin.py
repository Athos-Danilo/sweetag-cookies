import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

# Load DATABASE_URL from .env
def get_env_db_url():
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                if line.strip().startswith("DATABASE_URL="):
                    return line.strip().split("=", 1)[1].strip("\"'")
    return "postgresql+asyncpg://postgres:8156@localhost:5432/sweetag_cookies"

async def make_admin(whatsapp_number: str):
    db_url = get_env_db_url()
    print(f"Conectando ao banco em: {db_url}")
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Busca o usuário pelo Whatsapp
        result = await session.execute(select(User).where(User.whatsapp == whatsapp_number))
        user = result.scalars().first()
        
        if user:
            print(f"Usuário encontrado: {user.nome} (ID: {user.id})")
            user.is_admin = True
            session.add(user)
            await session.commit()
            print(f"✅ Usuário {user.nome} promovido a Administrador com sucesso!")
        else:
            print(f"❌ Usuário com WhatsApp '{whatsapp_number}' não encontrado no banco de dados.")
            print("Cadastre o usuário normalmente no frontend primeiro ou use o script para criá-lo.")
            
            # Pergunta se deseja criar um novo
            create_new = input("Deseja criar um novo usuário Administrador com este WhatsApp? (s/n): ").strip().lower()
            if create_new == 's':
                nome = input("Digite o nome do novo administrador: ").strip()
                new_user = User(
                    whatsapp=whatsapp_number,
                    nome=nome,
                    aceita_notificacoes=True,
                    is_admin=True
                )
                session.add(new_user)
                await session.commit()
                print(f"✅ Novo usuário administrador '{nome}' criado com sucesso!")

if __name__ == "__main__":
    whatsapp = "(87) 98168-8463"
    if len(sys.argv) > 1:
        whatsapp = sys.argv[1]
    
    asyncio.run(make_admin(whatsapp))
