from functools import lru_cache

from app.core.config import get_settings
from app.services.chat_service import ChatService
from app.services.openrouter_service import OpenRouterService
from app.services.session_store import SessionStore
from app.services.tavily_service import TavilyService


@lru_cache
def get_session_store() -> SessionStore:
    return SessionStore()


@lru_cache
def get_tavily_service() -> TavilyService:
    settings = get_settings()
    return TavilyService(settings)


@lru_cache
def get_openrouter_service() -> OpenRouterService:
    settings = get_settings()
    return OpenRouterService(settings)


@lru_cache
def get_chat_service() -> ChatService:
    settings = get_settings()
    return ChatService(
        openrouter_service=get_openrouter_service(),
        tavily_service=get_tavily_service(),
        session_store=get_session_store(),
    )
