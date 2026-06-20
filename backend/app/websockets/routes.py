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
