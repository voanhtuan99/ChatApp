from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.api.deps import get_chat_service
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def create_chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    return await chat_service.chat(request)


@router.post("/chat/stream")
async def stream_chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
) -> StreamingResponse:
    return StreamingResponse(
        chat_service.stream_chat(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
