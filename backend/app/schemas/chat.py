from typing import Literal, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


Role = Literal["system", "user", "assistant"]


class Message(BaseModel):
    role: Role
    content: str = Field(..., min_length=1, max_length=12000)

    @field_validator("content")
    @classmethod
    def sanitize_content(cls, value: str) -> str:
        sanitized = value.strip()
        if not sanitized:
            raise ValueError("Message content cannot be empty.")
        return sanitized


class Source(BaseModel):
    title: str
    url: HttpUrl
    snippet: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=12000)
    history: list[Message] = Field(default_factory=list)
    use_web_search: bool = False

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, value: str) -> str:
        sanitized = value.strip()
        if not sanitized:
            raise ValueError("Message cannot be empty.")
        return sanitized


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source] = Field(default_factory=list)
    model: str
    used_web_search: bool
    session_id: Optional[str] = None


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    max_results: int = Field(default=5, ge=1, le=10)

    @field_validator("query")
    @classmethod
    def sanitize_query(cls, value: str) -> str:
        sanitized = value.strip()
        if not sanitized:
            raise ValueError("Query cannot be empty.")
        return sanitized


class SearchResponse(BaseModel):
    query: str
    results: list[Source]


class AppConfigResponse(BaseModel):
    app_env: str
    default_model: str
    fallback_model: str
    tavily_enabled: bool
    streaming_transport: Literal["sse"]


class ChatContext(BaseModel):
    query: str
    history: list[Message]
    use_web_search: bool
    sources: list[Source] = Field(default_factory=list)
    search_summary: str = ""
    search_warning: str = ""
