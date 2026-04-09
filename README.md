# Chat App Capstone

Production-ready AI chat starter with a separated Next.js frontend and FastAPI backend.

## A. Tom tat kien truc

- `frontend/`: Next.js App Router, TypeScript, Tailwind CSS, local conversation state, SSE streaming render, markdown UI.
- `backend/`: FastAPI, pydantic settings, Tavily search orchestration, OpenRouter model invocation with fallback, SSE chat streaming.
- REST contract:
  - `GET /health`
  - `GET /api/config`
  - `POST /api/search`
  - `POST /api/chat`
  - `POST /api/chat/stream`
- Extensibility:
  - clear service layer for future RAG retriever injection
  - local session store can be replaced by database repository
  - frontend conversation state can move from localStorage to authenticated API

## B. Cay thu muc

```text
chat-app-capstone/
├─ backend/
│  ├─ .env.example
│  ├─ requirements.txt
│  ├─ README.md
│  └─ app/
│     ├─ __init__.py
│     ├─ main.py
│     ├─ api/
│     │  ├─ __init__.py
│     │  ├─ deps.py
│     │  └─ routes/
│     │     ├─ __init__.py
│     │     ├─ chat.py
│     │     ├─ config.py
│     │     ├─ health.py
│     │     └─ search.py
│     ├─ core/
│     │  ├─ __init__.py
│     │  ├─ config.py
│     │  ├─ exceptions.py
│     │  └─ logging.py
│     ├─ schemas/
│     │  ├─ __init__.py
│     │  └─ chat.py
│     └─ services/
│        ├─ __init__.py
│        ├─ chat_service.py
│        ├─ openrouter_service.py
│        ├─ session_store.py
│        └─ tavily_service.py
└─ frontend/
   ├─ .env.example
   ├─ package.json
   ├─ tsconfig.json
   ├─ next.config.ts
   ├─ postcss.config.mjs
   ├─ eslint.config.mjs
   ├─ next-env.d.ts
   ├─ app/
   │  ├─ globals.css
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  └─ chat/
   │     └─ page.tsx
   ├─ components/
   │  ├─ ChatInput.tsx
   │  ├─ ChatLayout.tsx
   │  ├─ Header.tsx
   │  ├─ MessageBubble.tsx
   │  ├─ MessageList.tsx
   │  ├─ Sidebar.tsx
   │  ├─ SourceList.tsx
   │  └─ ui/
   │     ├─ CodeBlock.tsx
   │     └─ Toast.tsx
   ├─ hooks/
   │  ├─ useChat.ts
   │  ├─ useLocalConversations.ts
   │  └─ useStreamingChat.ts
   └─ lib/
      ├─ api.ts
      ├─ types.ts
      └─ utils.ts
```

## C. Backend

### Core flow

1. Frontend sends `POST /api/chat` or `POST /api/chat/stream`.
2. Backend validates payload with Pydantic.
3. `ChatService` optionally calls `TavilyService` when `use_web_search=true`.
4. Search results are normalized into `Source` objects and summarized into prompt context.
5. `OpenRouterService` calls the configured model, and falls back to `OPENROUTER_FALLBACK_MODEL` if the primary model fails.
6. Backend returns JSON or SSE events:
   - `meta`: sources and session metadata
   - `token`: streamed content chunks
   - `done`: final answer and sources

### Prompting strategy

System prompt is centralized in [chat_service.py](/C:/Projects/ChatApp/backend/app/services/chat_service.py) and enforces:

- concise, accurate answers
- source-grounded behavior when search context exists
- explicit uncertainty when evidence is incomplete
- no fabricated citations

### Environment

Backend example env is in [backend/.env.example](/C:/Projects/ChatApp/backend/.env.example).

```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=qwen/qwen3.6-plus:free
OPENROUTER_FALLBACK_MODEL=openrouter/free
TAVILY_API_KEY=
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
FRONTEND_ORIGIN=http://localhost:3000
```

## D. Frontend

### UX structure

- Landing page: marketing-style intro and feature summary
- Chat page: left sidebar + right chat workspace
- Sidebar: local history stored in browser localStorage
- Message area: markdown rendering, streaming state, empty state, source cards
- Input area: textarea, send button, clear button, web-search toggle
- Error UX: toast for transport/runtime failures

### Streaming behavior

- Frontend calls `POST /api/chat/stream`
- Reads SSE chunks from `ReadableStream`
- Applies `meta`, `token`, and `done` events incrementally
- Updates the current assistant message in place

Frontend example env is in [frontend/.env.example](/C:/Projects/ChatApp/frontend/.env.example).

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## E. Huong dan chay project

### 1. Run backend

```powershell
cd C:\Projects\ChatApp\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Run frontend

```powershell
cd C:\Projects\ChatApp\frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## API contract

### `POST /api/chat`

Request:

```json
{
  "message": "Tom tat tin tuc AI hom nay",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "use_web_search": true
}
```

Response:

```json
{
  "answer": "...",
  "sources": [
    {
      "title": "...",
      "url": "https://...",
      "snippet": "..."
    }
  ],
  "model": "qwen/qwen3.6-plus:free",
  "used_web_search": true,
  "session_id": "..."
}
```

### `POST /api/chat/stream`

SSE events:

- `meta`
- `token`
- `done`

## Deploy guide

### Backend deploy

- Render / Railway / Fly.io:
  - set env vars from `backend/.env.example`
  - start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add your frontend production domain into `FRONTEND_ORIGIN`

### Frontend deploy

- Vercel is the easiest target
- Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend URL
- Build command: `npm run build`
- Start command: `npm run start`

## Roadmap mo rong

### 1. RAG with file upload

- Add `/api/files/upload` and a document ingestion pipeline
- Split retriever into a new service like `services/retrieval_service.py`
- Store embeddings in pgvector, Qdrant, Weaviate, or Pinecone
- Inject top-k chunks into the same prompt-building step now handled by `ChatService`

### 2. Database-backed chat history

- Replace `SessionStore` with a repository layer
- Suggested tables:
  - `users`
  - `chat_sessions`
  - `chat_messages`
  - `message_sources`
- Move frontend local history to backend session APIs

### 3. Auth

- Add Next.js auth gateway using Auth.js or Clerk
- Issue backend JWT or verify provider tokens in FastAPI
- Scope chat sessions per authenticated user

## Assumptions

- Workspace was empty, so the project was scaffolded from scratch instead of refactoring existing code.
- SSE is used for streaming because it keeps the frontend simpler than raw chunk parsing or websockets for this MVP.
- Session persistence is in-memory on the backend and localStorage on the frontend for MVP speed; production should move both to a database.

## Local commands

```powershell
# backend
cd C:\Projects\ChatApp\backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# frontend
cd C:\Projects\ChatApp\frontend
npm run dev
```
