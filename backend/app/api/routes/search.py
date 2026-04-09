from fastapi import APIRouter, Depends

from app.api.deps import get_tavily_service
from app.schemas.chat import SearchRequest, SearchResponse
from app.services.tavily_service import TavilyService

router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search", response_model=SearchResponse)
async def search_web(
    request: SearchRequest,
    tavily_service: TavilyService = Depends(get_tavily_service),
) -> SearchResponse:
    results = await tavily_service.search(request.query, max_results=request.max_results)
    return SearchResponse(query=request.query, results=results)
