from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator

from app.core.exceptions import AppError
from app.schemas.chat import ChatContext, ChatRequest, ChatResponse, Message, Source
from app.services.openrouter_service import OpenRouterService
from app.services.session_store import SessionStore
from app.services.tavily_service import TavilyService

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are a helpful AI assistant.
- Be concise, accurate, and direct.
- Reply in the same language as the user's latest message unless the user asks for another language.
- When search context is provided, prioritize it and do not invent sources.
- If search context is incomplete or uncertain, explicitly say so.
- Keep answers well-structured.
- When sources are relevant, end with a short references section title translated to the same language as the answer.
- Do not use the Vietnamese phrase 'Nguon tham khao' unless the answer itself is in Vietnamese.
"""


class ChatService:
    def __init__(
        self,
        openrouter_service: OpenRouterService,
        tavily_service: TavilyService,
        session_store: SessionStore,
    ) -> None:
        self.openrouter_service = openrouter_service
        self.tavily_service = tavily_service
        self.session_store = session_store

    async def chat(self, request: ChatRequest) -> ChatResponse:
        context = await self._build_context(request)
        messages = self._build_messages(context)
        response = await self.openrouter_service.create_chat_completion(messages, stream=False)
        answer = (
            response.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        model = response.get("model") or "unknown"
        session_id = self.session_store.create_session()
        self.session_store.append_messages(
            session_id,
            [
                Message(role="user", content=request.message),
                Message(role="assistant", content=answer or "No response returned."),
            ],
        )
        return ChatResponse(
            answer=answer,
            sources=context.sources,
            model=model,
            used_web_search=request.use_web_search,
            session_id=session_id,
        )

    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        session_id = self.session_store.create_session()
        try:
            context = await self._build_context(request)
            messages = self._build_messages(context)
            stream = await self.openrouter_service.create_chat_completion(messages, stream=True)

            yield self._format_sse(
                "meta",
                {
                    "sources": [source.model_dump(mode="json") for source in context.sources],
                    "session_id": session_id,
                    "used_web_search": request.use_web_search,
                    "search_warning": context.search_warning,
                },
            )

            chunks: list[str] = []
            async for chunk in stream:
                chunks.append(chunk)
                yield self._format_sse("token", {"content": chunk})

            answer = "".join(chunks).strip()
            self.session_store.append_messages(
                session_id,
                [
                    Message(role="user", content=request.message),
                    Message(role="assistant", content=answer or "No response returned."),
                ],
            )
            yield self._format_sse(
                "done",
                {
                    "answer": answer,
                    "sources": [source.model_dump(mode="json") for source in context.sources],
                    "session_id": session_id,
                    "used_web_search": request.use_web_search,
                },
            )
        except AppError as exc:
            logger.warning("Streaming chat failed with AppError: %s", exc.message)
            yield self._format_sse("error", {"message": exc.message, "status_code": exc.status_code})
        except Exception as exc:
            logger.exception("Streaming chat failed with unexpected error: %s", exc)
            yield self._format_sse("error", {"message": "Internal server error.", "status_code": 500})

    async def _build_context(self, request: ChatRequest) -> ChatContext:
        sources: list[Source] = []
        summary = ""
        search_warning = ""
        if request.use_web_search:
            try:
                sources = await self.tavily_service.search(request.message)
                summary = self.tavily_service.summarize(sources)
            except AppError as exc:
                logger.warning("Web search unavailable, continuing without sources: %s", exc.message)
                sources = []
                summary = ""
                search_warning = "Web search is currently unavailable, so the answer may be less up-to-date."
        return ChatContext(
            query=request.message,
            history=request.history,
            use_web_search=request.use_web_search,
            sources=sources,
            search_summary=summary,
            search_warning=search_warning,
        )

    def _build_messages(self, context: ChatContext) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
        if context.search_summary:
            messages.append(
                {
                    "role": "system",
                    "content": (
                        "Search context from Tavily:\n"
                        f"{context.search_summary}\n\n"
                        "Use only this context for factual web claims and cite it carefully."
                    ),
                }
            )
        for message in context.history[-12:]:
            messages.append({"role": message.role, "content": message.content})
        messages.append({"role": "user", "content": context.query})
        return messages

    @staticmethod
    def _format_sse(event: str, payload: dict) -> str:
        return f"event: {event}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
