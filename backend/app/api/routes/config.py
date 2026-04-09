from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.chat import AppConfigResponse

router = APIRouter(prefix="/api", tags=["config"])


@router.get("/config", response_model=AppConfigResponse)
async def get_app_config() -> AppConfigResponse:
    settings = get_settings()
    return AppConfigResponse(
        app_env=settings.app_env,
        default_model=settings.openrouter_model,
        fallback_model=settings.openrouter_fallback_model,
        tavily_enabled=bool(settings.tavily_api_key),
        streaming_transport="sse",
    )
