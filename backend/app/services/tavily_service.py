from __future__ import annotations

import asyncio
import logging

import httpx

from app.core.config import Settings
from app.core.exceptions import ConfigurationError, ExternalServiceError
from app.schemas.chat import Source

logger = logging.getLogger(__name__)


class TavilyService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def search(self, query: str, max_results: int | None = None) -> list[Source]:
        if not self.settings.tavily_api_key:
            raise ConfigurationError("Missing TAVILY_API_KEY.", status_code=500)

        payload = {
            "api_key": self.settings.tavily_api_key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": False,
            "include_raw_content": False,
            "max_results": max_results or self.settings.tavily_max_results,
        }

        retries = 2
        for attempt in range(retries + 1):
            try:
                async with httpx.AsyncClient(
                    base_url=self.settings.tavily_base_url,
                    timeout=self.settings.tavily_timeout_seconds,
                ) as client:
                    response = await client.post("/search", json=payload)
                    response.raise_for_status()
                    data = response.json()
                    return self._normalize_results(data.get("results", []))
            except (httpx.HTTPError, ValueError) as exc:
                logger.warning("Tavily request failed on attempt %s: %s", attempt + 1, exc)
                if attempt >= retries:
                    raise ExternalServiceError(
                        "Unable to retrieve web search results right now.",
                        status_code=502,
                    ) from exc
                await asyncio.sleep(0.4 * (attempt + 1))

        return []

    def summarize(self, sources: list[Source]) -> str:
        if not sources:
            return ""

        lines = []
        for index, source in enumerate(sources, start=1):
            lines.append(
                f"[{index}] {source.title}\nURL: {source.url}\nSnippet: {source.snippet}"
            )
        return "\n\n".join(lines)

    @staticmethod
    def _normalize_results(results: list[dict]) -> list[Source]:
        normalized: list[Source] = []
        for item in results:
            url = item.get("url")
            title = (item.get("title") or "Untitled source").strip()
            snippet = (item.get("content") or item.get("snippet") or "").strip()
            if not url or not snippet:
                continue
            normalized.append(Source(title=title, url=url, snippet=snippet[:500]))
        return normalized
