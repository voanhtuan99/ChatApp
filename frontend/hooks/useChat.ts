"use client";

import { useEffect, useState } from "react";

import { useLocalConversations } from "@/hooks/useLocalConversations";
import { createId } from "@/lib/utils";
import type { Conversation, Message } from "@/lib/types";

function newConversation(): Conversation {
  return {
    id: createId("conversation"),
    title: "New chat",
    updatedAt: new Date().toISOString(),
    messages: [],
  };
}

export function useChat() {
  const { conversations, setConversations, hydrated } = useLocalConversations();
  const [activeConversationId, setActiveConversationId] = useState<string>("");

  useEffect(() => {
    if (!hydrated) return;
    if (conversations.length === 0) {
      const conversation = newConversation();
      setConversations([conversation]);
      setActiveConversationId(conversation.id);
      return;
    }
    if (!activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, hydrated, setConversations]);

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0];

  const updateConversation = (conversationId: string, updater: (conversation: Conversation) => Conversation) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation,
      ),
    );
  };

  const createConversation = () => {
    const conversation = newConversation();
    setConversations((current) => [conversation, ...current]);
    setActiveConversationId(conversation.id);
  };

  const clearConversation = (conversationId: string) => {
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      title: "New chat",
      updatedAt: new Date().toISOString(),
      messages: [],
    }));
  };

  const appendMessage = (conversationId: string, message: Message) => {
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      title:
        conversation.messages.length === 0 && message.role === "user"
          ? message.content.slice(0, 40)
          : conversation.title,
      updatedAt: new Date().toISOString(),
      messages: [...conversation.messages, message],
    }));
  };

  const replaceLastAssistantMessage = (conversationId: string, updater: (message: Message) => Message) => {
    updateConversation(conversationId, (conversation) => {
      const nextMessages = [...conversation.messages];
      for (let index = nextMessages.length - 1; index >= 0; index -= 1) {
        if (nextMessages[index]?.role === "assistant") {
          nextMessages[index] = updater(nextMessages[index]);
          break;
        }
      }
      return {
        ...conversation,
        updatedAt: new Date().toISOString(),
        messages: nextMessages,
      };
    });
  };

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    clearConversation,
    appendMessage,
    replaceLastAssistantMessage,
    hydrated,
  };
}
