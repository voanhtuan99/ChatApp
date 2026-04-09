import type { AppConfigResponse, ChatRequest, ChatResponse, Source } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export async function getAppConfig(): Promise<AppConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/api/config`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load app config.");
  }
  return response.json() as Promise<AppConfigResponse>;
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed." }));
    throw new Error(error.detail ?? "Request failed.");
  }

  return response.json() as Promise<ChatResponse>;
}

export async function searchWeb(query: string): Promise<Source[]> {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, max_results: 5 }),
  });

  if (!response.ok) {
    throw new Error("Search request failed.");
  }

  const data = (await response.json()) as { results: Source[] };
  return data.results;
}

export function streamChatMessage(
  payload: ChatRequest,
  handlers: {
    onMeta?: (meta: {
      sources: Source[];
      session_id: string;
      used_web_search: boolean;
      search_warning?: string;
    }) => void;
    onToken?: (token: string) => void;
    onDone?: (data: {
      answer: string;
      sources: Source[];
      session_id: string;
      used_web_search: boolean;
    }) => void;
    onError?: (message: string) => void;
  },
) {
  const controller = new AbortController();

  void (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const error = await response.json().catch(() => ({ detail: "Streaming request failed." }));
        throw new Error(error.detail ?? "Streaming request failed.");
      }

      const decoder = new TextDecoder();
      const reader = response.body.getReader();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const segments = buffer.split("\n\n");
        buffer = segments.pop() ?? "";

        for (const segment of segments) {
          const lines = segment.split("\n");
          const event = lines.find((line) => line.startsWith("event:"))?.replace("event:", "").trim();
          const dataLine = lines.find((line) => line.startsWith("data:"))?.replace("data:", "").trim();
          if (!event || !dataLine) continue;
          const data = JSON.parse(dataLine) as Record<string, unknown>;
          if (event === "meta") {
            handlers.onMeta?.(
              data as {
                sources: Source[];
                session_id: string;
                used_web_search: boolean;
                search_warning?: string;
              },
            );
          }
          if (event === "token") {
            handlers.onToken?.(String(data.content ?? ""));
          }
          if (event === "done") {
            handlers.onDone?.(
              data as { answer: string; sources: Source[]; session_id: string; used_web_search: boolean },
            );
          }
          if (event === "error") {
            handlers.onError?.(String(data.message ?? "Streaming request failed."));
            return;
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      handlers.onError?.((error as Error).message || "Streaming request failed.");
    }
  })();

  return () => controller.abort();
}
