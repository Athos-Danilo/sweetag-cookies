from fastapi import WebSocket
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> WebSocket
        self.active_connections: Dict[int, WebSocket] = {}
        # Maps admin_id -> WebSocket
        self.admin_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")

    async def connect_admin(self, websocket: WebSocket, admin_id: int):
        await websocket.accept()
        self.admin_connections[admin_id] = websocket
        logger.info(f"Admin {admin_id} connected. Total admin connections: {len(self.admin_connections)}")

    def disconnect_admin(self, admin_id: int):
        if admin_id in self.admin_connections:
            del self.admin_connections[admin_id]
            logger.info(f"Admin {admin_id} disconnected. Total admin connections: {len(self.admin_connections)}")

    async def send_personal_message(self, message: dict, user_id: int):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(message)
                return True
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)
        return False

    async def broadcast_to_admins(self, message: dict):
        disconnected_admins = []
        for admin_id, websocket in self.admin_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to admin {admin_id}: {e}")
                disconnected_admins.append(admin_id)
        for admin_id in disconnected_admins:
            self.disconnect_admin(admin_id)

manager = ConnectionManager()
