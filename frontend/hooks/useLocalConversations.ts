"use client";

import { useEffect, useState } from "react";

import type { Conversation } from "@/lib/types";

const STORAGE_KEY = "chat-app-capstone.conversations";

export function useLocalConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setConversations(JSON.parse(raw) as Conversation[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations, hydrated]);

  return { conversations, setConversations, hydrated };
}
