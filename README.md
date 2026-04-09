# Chat App Capstone

Production-ready AI chat starter with a separated Next.js frontend and FastAPI backend.

## Architecture Overview

- `frontend/`: Next.js App Router, TypeScript, Tailwind CSS, local conversation state, SSE streaming rendering, markdown UI.
- `backend/`: FastAPI, Pydantic settings, Tavily search orchestration, OpenRouter model invocation with fallback, SSE streaming.
- REST APIs:
  - `GET /health`
  - `GET /api/config`
  - `POST /api/search`
  - `POST /api/chat`
  - `POST /api/chat/stream`

## Folder Structure

```text
chat-app-capstone/
|- backend/
|  |- .env.example
|  |- requirements.txt
|  `- app/
|     |- main.py
|     |- api/
|     |- core/
|     |- schemas/
|     `- services/
`- frontend/
   |- .env.example
   |- package.json
   |- app/
   |- components/
   |- hooks/
   `- lib/
```

## Get API Keys

### OpenRouter API key

1. Go to [OpenRouter](https://openrouter.ai/).
2. Sign in and open the API Keys page.
3. Create a new API key.
4. Copy the key and set `OPENROUTER_API_KEY` in `backend/.env`.

Recommended model variables:

```env
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
OPENROUTER_FALLBACK_MODEL=openrouter/free
```

### Tavily API key

1. Go to [Tavily](https://tavily.com/).
2. Sign in and open your dashboard/API section.
3. Create an API key.
4. Copy the key and set `TAVILY_API_KEY` in `backend/.env`.

If `TAVILY_API_KEY` is empty, chat still works, but web search will gracefully fall back.

## Environment Setup

### Backend: create `.env` from example

From `cmd`:

```bat
cd C:\Projects\ChatApp\backend
copy .env.example .env
```

From PowerShell:

```powershell
cd C:\Projects\ChatApp\backend
Copy-Item .env.example .env
```

Edit `backend/.env` and fill:

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
OPENROUTER_FALLBACK_MODEL=openrouter/free
TAVILY_API_KEY=your_tavily_key
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
FRONTEND_ORIGIN=http://localhost:3000
```

### Frontend: create `.env.local` from example

From `cmd`:

```bat
cd C:\Projects\ChatApp\frontend
copy .env.example .env.local
```

From PowerShell:

```powershell
cd C:\Projects\ChatApp\frontend
Copy-Item .env.example .env.local
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Run Locally

### 1. Start backend

```bat
cd C:\Projects\ChatApp\backend
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start frontend

```bat
cd C:\Projects\ChatApp\frontend
npm.cmd install
npm.cmd run dev
```

Open:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## API Contract

### `POST /api/chat`

Request:

```json
{
  "message": "Summarize today's AI news",
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
  "model": "google/gemma-4-26b-a4b-it:free",
  "used_web_search": true,
  "session_id": "..."
}
```

### `POST /api/chat/stream`

SSE events:

- `meta`
- `token`
- `done`
- `error`

## Deploy

### Backend

- Deploy to Render, Railway, or Fly.io.
- Set environment variables from `backend/.env.example`.
- Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

- Set `FRONTEND_ORIGIN` to your production frontend domain.

### Frontend

- Deploy to Vercel (or any Node hosting).
- Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend URL.
- Build command: `npm run build`
- Start command: `npm run start`

## Extension Roadmap

### RAG with file upload

- Add `/api/files/upload` and a document ingestion pipeline.
- Add a retrieval service (for example `services/retrieval_service.py`).
- Store embeddings in pgvector, Qdrant, Weaviate, or Pinecone.
- Inject retrieved chunks in `ChatService` prompt building.

### Persistent chat history

- Replace in-memory `SessionStore` with a database repository.
- Suggested tables: `users`, `chat_sessions`, `chat_messages`, `message_sources`.

### Authentication

- Add Auth.js or Clerk in frontend.
- Validate issued tokens in FastAPI.
- Scope sessions and messages per authenticated user.
