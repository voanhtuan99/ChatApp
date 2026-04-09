import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ApiHistoryMessage, Message } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toApiHistory(messages: Message[]): ApiHistoryMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function formatRelativeTime(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
