"use client";

import { useEffect, useState } from "react";

import { ChatInput } from "@/components/ChatInput";
import { Header } from "@/components/Header";
import { MessageList } from "@/components/MessageList";
import { Sidebar } from "@/components/Sidebar";
import { Toast } from "@/components/ui/Toast";
import { useChat } from "@/hooks/useChat";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { getAppConfig } from "@/lib/api";

export function ChatLayout() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    clearConversation,
    deleteConversation,
    appendMessage,
    replaceLastAssistantMessage,
    hydrated,
  } = useChat();
  const { sendStreamingMessage, isStreaming, error, setError } = useStreamingChat();
  const [useWebSearch, setUseWebSearch] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getAppConfig()
      .then((config) => {
        if (!mounted) return;
        setUseWebSearch(config.tavily_enabled);
      })
      .catch(() => {
        if (!mounted) return;
        setUseWebSearch(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      const timer = window.setTimeout(() => setError(null), 5000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [error, setError]);

  if (!hydrated || !activeConversation) {
    return (
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
        <div className="glass rounded-[2rem] px-8 py-6 text-sm text-slate-300">Loading workspace...</div>
      </div>
    );
  }

  const submit = (message: string) => {
    sendStreamingMessage({
      messages: activeConversation.messages,
      message,
      useWebSearch,
      onUserMessage: (nextMessage) => appendMessage(activeConversation.id, nextMessage),
      onAssistantPlaceholder: (nextMessage) => appendMessage(activeConversation.id, nextMessage),
      onAssistantUpdate: (updater) => replaceLastAssistantMessage(activeConversation.id, updater),
    });
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-4 md:px-6 md:py-6 lg:h-[100dvh] lg:overflow-hidden">
      <div className="grid gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onCreateConversation={createConversation}
          onDeleteConversation={deleteConversation}
          onSelectConversation={setActiveConversationId}
        />
        <main className="glass flex min-h-[720px] flex-col rounded-[2rem] lg:h-full lg:min-h-0">
          <Header title="Realtime AI Chat" subtitle="Streaming responses with optional web search context" />
          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="min-h-0 flex-1">
              <MessageList isStreaming={isStreaming} messages={activeConversation.messages} />
            </div>
            <ChatInput
              disabled={isStreaming}
              onClear={() => clearConversation(activeConversation.id)}
              onSubmit={submit}
              onToggleWebSearch={setUseWebSearch}
              useWebSearch={useWebSearch}
            />
          </div>
        </main>
      </div>
      {error ? <Toast message={error} onDismiss={() => setError(null)} /> : null}
    </div>
  );
}
