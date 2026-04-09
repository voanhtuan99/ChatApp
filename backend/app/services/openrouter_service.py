from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator

import httpx

from app.core.config import Settings
from app.core.exceptions import ConfigurationError, ExternalServiceError

logger = logging.getLogger(__name__)


class OpenRouterService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def create_chat_completion(
        self,
        messages: list[dict[str, str]],
        stream: bool = False,
    ) -> dict | AsyncGenerator[str, None]:
        if not self.settings.openrouter_api_key:
            raise ConfigurationError("Missing OPENROUTER_API_KEY.", status_code=500)

        request_payload = {
            "model": self.settings.openrouter_model,
            "messages": messages,
            "temperature": 0.4,
            "stream": stream,
        }

        try:
            return await self._request_completion(request_payload, stream=stream)
        except ExternalServiceError as primary_error:
            logger.warning("Primary model failed, falling back: %s", primary_error.message)
            request_payload["model"] = self.settings.openrouter_fallback_model
            return await self._request_completion(request_payload, stream=stream)

    async def _request_completion(
        self,
        payload: dict,
        stream: bool,
    ) -> dict | AsyncGenerator[str, None]:
        headers = {
            "Authorization": f"Bearer {self.settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "chat-app-capstone",
        }

        if stream:
            return self._stream_completion(headers, payload)

        try:
            async with httpx.AsyncClient(
                base_url=self.settings.openrouter_base_url,
                timeout=self.settings.openrouter_timeout_seconds,
            ) as client:
                response = await client.post("/chat/completions", json=payload, headers=headers)
                response.raise_for_status()
                return response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise ExternalServiceError("OpenRouter completion request failed.", status_code=502) from exc

    async def _stream_completion(
        self,
        headers: dict[str, str],
        payload: dict,
    ) -> AsyncGenerator[str, None]:
        try:
            async with httpx.AsyncClient(
                base_url=self.settings.openrouter_base_url,
                timeout=self.settings.openrouter_timeout_seconds,
            ) as client:
                async with client.stream(
                    "POST",
                    "/chat/completions",
                    json=payload,
                    headers=headers,
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data:"):
                            continue
                        data = line.removeprefix("data:").strip()
                        if data == "[DONE]":
                            break
                        try:
                            payload = json.loads(data)
                        except json.JSONDecodeError:
                            continue
                        delta = (
                            payload.get("choices", [{}])[0]
                            .get("delta", {})
                            .get("content")
                        )
                        if delta:
                            yield delta
        except httpx.HTTPError as exc:
            raise ExternalServiceError("OpenRouter streaming request failed.", status_code=502) from exc
