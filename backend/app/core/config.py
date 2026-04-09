from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = Field(default="development", alias="APP_ENV")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    frontend_origin: str = Field(default="http://localhost:3000", alias="FRONTEND_ORIGIN")

    openrouter_api_key: str = Field(default="", alias="OPENROUTER_API_KEY")
    openrouter_model: str = Field(default="google/gemma-4-26b-a4b-it:free", alias="OPENROUTER_MODEL")
    openrouter_fallback_model: str = Field(default="openrouter/free", alias="OPENROUTER_FALLBACK_MODEL")
    openrouter_base_url: str = Field(default="https://openrouter.ai/api/v1", alias="OPENROUTER_BASE_URL")
    openrouter_timeout_seconds: float = Field(default=60.0, alias="OPENROUTER_TIMEOUT_SECONDS")

    tavily_api_key: str = Field(default="", alias="TAVILY_API_KEY")
    tavily_base_url: str = Field(default="https://api.tavily.com", alias="TAVILY_BASE_URL")
    tavily_timeout_seconds: float = Field(default=20.0, alias="TAVILY_TIMEOUT_SECONDS")
    tavily_max_results: int = Field(default=5, alias="TAVILY_MAX_RESULTS")

    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    request_timeout_seconds: float = Field(default=30.0, alias="REQUEST_TIMEOUT_SECONDS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.frontend_origin.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
