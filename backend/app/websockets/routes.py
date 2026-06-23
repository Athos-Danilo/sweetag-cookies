from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websockets.manager import manager
from jose import jwt, JWTError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

@router.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, token: str = Query(...)):
    # Validate token to ensure the user is who they claim to be
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_user_id = payload.get("sub")
        if str(token_user_id) != str(user_id):
            logger.warning(f"WebSocket connection failed: token user_id ({token_user_id}) does not match path user_id ({user_id})")
            await websocket.close(code=1008)
            return
    except JWTError as e:
        logger.warning(f"WebSocket connection failed: invalid token. Error: {e}")
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            # We just wait for messages to handle disconnects properly
            data = await websocket.receive_text()
            # If we want to handle ping/pong or client messages, we can do it here
    except WebSocketDisconnect:
        manager.disconnect(user_id)


from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from sqlalchemy.future import select

@router.websocket("/ws/admin")
async def websocket_admin_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint de WebSocket exclusivo para administradores.
    Valida o token JWT e verifica no banco de dados se o usuário é administrador.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            await websocket.close(code=1008)
            return
    except JWTError as e:
        logger.warning(f"WebSocket admin connection failed: invalid token. Error: {e}")
        await websocket.close(code=1008)
        return

    # Verifica no banco se é admin
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user or not user.is_admin:
        logger.warning(f"WebSocket admin connection failed: user {user_id} is not admin")
        await websocket.close(code=1008)
        return

    await manager.connect_admin(websocket, int(user_id))
    try:
        while True:
            # Mantém a conexão ativa escutando mensagens do cliente
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_admin(int(user_id))
