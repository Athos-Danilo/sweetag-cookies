import asyncio
import logging
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.models.order import Order
from app.models.product import Product

logger = logging.getLogger(__name__)

async def expire_orders_worker():
    logger.info("Iniciando Worker de expiração de reservas...")
    while True:
        try:
            async with AsyncSessionLocal() as db:
                # 1. Buscar pedidos com status "Aguardando" expirados
                now = datetime.utcnow()
                stmt = (
                    select(Order)
                    .options(selectinload(Order.items))
                    .where(Order.status == "Aguardando", Order.expires_at < now)
                )
                result = await db.execute(stmt)
                expired_orders = result.scalars().all()
                
                for order in expired_orders:
                    logger.info(f"Expirando pedido ID {order.id}...")
                    
                    # Restituição do estoque com lock pessimista
                    for item in order.items:
                        if item.product_id:
                            prod_stmt = select(Product).where(Product.id == item.product_id).with_for_update()
                            prod_result = await db.execute(prod_stmt)
                            product = prod_result.scalars().first()
                            if product:
                                product.stock_quantity += item.quantity
                                logger.info(f"Devolvendo {item.quantity} unidades ao estoque de '{product.name}'.")
                                
                    order.status = "EXPIRADO"
                    
                if expired_orders:
                    await db.commit()
                    logger.info(f"Total de {len(expired_orders)} pedidos expirados com sucesso.")
        except Exception as e:
            logger.error(f"Erro no Worker de expiração de reservas: {e}")
            
        # Executa a cada 60 segundos
        await asyncio.sleep(60)

def start_expiration_worker():
    asyncio.create_task(expire_orders_worker())
