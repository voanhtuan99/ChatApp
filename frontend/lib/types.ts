export type Role = "user" | "assistant" | "system";

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface Message {
  id: string;
  role: Exclude<Role, "system">;
  content: string;
  sources?: Source[];
  createdAt: string;
  isStreaming?: boolean;
  error?: string;
}

export interface ApiHistoryMessage {
  role: Role;
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ApiHistoryMessage[];
  use_web_search: boolean;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  model: string;
  used_web_search: boolean;
  session_id?: string | null;
}

export interface AppConfigResponse {
  app_env: string;
  default_model: string;
  fallback_model: string;
  tavily_enabled: boolean;
  streaming_transport: "sse";
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}
