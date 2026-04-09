from __future__ import annotations

from collections import defaultdict
from uuid import uuid4

from app.schemas.chat import Message


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, list[Message]] = defaultdict(list)

    def create_session(self) -> str:
        session_id = str(uuid4())
        self._sessions[session_id] = []
        return session_id

    def get_history(self, session_id: str) -> list[Message]:
        return list(self._sessions.get(session_id, []))

    def append_messages(self, session_id: str, messages: list[Message]) -> None:
        self._sessions[session_id].extend(messages)
