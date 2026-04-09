"use client";

import { useState } from "react";

import { streamChatMessage } from "@/lib/api";
import { createId, toApiHistory } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface StreamParams {
  messages: Message[];
  message: string;
  useWebSearch: boolean;
  onUserMessage: (message: Message) => void;
  onAssistantPlaceholder: (message: Message) => void;
  onAssistantUpdate: (updater: (message: Message) => Message) => void;
}

export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendStreamingMessage = ({
    messages,
    message,
    useWebSearch,
    onUserMessage,
    onAssistantPlaceholder,
    onAssistantUpdate,
  }: StreamParams) => {
    setIsStreaming(true);
    setError(null);

    const userMessage: Message = {
      id: createId("msg"),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage: Message = {
      id: createId("msg"),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isStreaming: true,
      sources: [],
    };

    onUserMessage(userMessage);
    onAssistantPlaceholder(assistantMessage);

    const history = toApiHistory([...messages, userMessage]);

    return streamChatMessage(
      {
        message,
        history,
        use_web_search: useWebSearch,
      },
      {
        onMeta: (meta) => {
          if (meta.search_warning) {
            setError(meta.search_warning);
          }
          onAssistantUpdate((current) => ({
            ...current,
            sources: meta.sources,
          }));
        },
        onToken: (token) => {
          onAssistantUpdate((current) => ({
            ...current,
            content: `${current.content}${token}`,
          }));
        },
        onDone: (data) => {
          onAssistantUpdate((current) => ({
            ...current,
            content: data.answer,
            sources: data.sources,
            isStreaming: false,
          }));
          setIsStreaming(false);
        },
        onError: (messageText) => {
          onAssistantUpdate((current) => ({
            ...current,
            content: current.content || "The assistant could not complete this request.",
            error: messageText,
            isStreaming: false,
          }));
          setError(messageText);
          setIsStreaming(false);
        },
      },
    );
  };

  return {
    sendStreamingMessage,
    isStreaming,
    error,
    setError,
  };
}
