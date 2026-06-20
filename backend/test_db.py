import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine

def get_env_db_url():
    """Tenta ler a DATABASE_URL diretamente do arquivo .env local."""
    if os.path.exists(".env"):
        try:
            with open(".env", "r") as f:
                for line in f:
                    if line.strip().startswith("DATABASE_URL="):
                        val = line.strip().split("=", 1)[1]
                        return val.strip("\"'")
        except Exception:
            pass
    return None

async def try_connect(url: str) -> bool:
    """Tenta se conectar a uma URL específica do banco de dados."""
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            return True
    except Exception:
        return False

async def main():
    # 1. Tenta carregar do .env local
    env_url = get_env_db_url()
    urls_to_try = []
    
    if env_url:
        urls_to_try.append(("URL do arquivo .env local", env_url))
    
    # 2. Adiciona as URLs fallback (do Athos e do Amigo)
    urls_to_try.append((
        "Configuração local (Athos - 8156)", 
        "postgresql+asyncpg://postgres:8156@localhost:5432/sweetag_cookies"
    ))
    urls_to_try.append((
        "Configuração local (Amigo - projectcookiesag)", 
        "postgresql+asyncpg://postgres:projectcookiesag@localhost:5432/meu_projeto_dev"
    ))

    print("Iniciando testes de conexão com o banco de dados...")
    
    connected = False
    for name, url in urls_to_try:
        print(f"Tentando conectar usando: {name}...")
        if await try_connect(url):
            print(f"✅ Conectado com sucesso usando: {name}!")
            connected = True
            break
        else:
            print(f"❌ Falha ao conectar usando: {name}.")

    if not connected:
        print("\n❌ Nenhuma das configurações de banco de dados funcionou. Verifique se o PostgreSQL está rodando localmente.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

