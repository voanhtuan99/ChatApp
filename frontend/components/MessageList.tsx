"use client";

import { useEffect, useRef } from "react";

import { MessageBubble } from "@/components/MessageBubble";
import type { Message } from "@/lib/types";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="glass flex h-full min-h-[420px] flex-col items-center justify-center rounded-[2rem] p-10 text-center">
        <div className="max-w-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-300/80">Empty state</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Start with a sharp question.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Ask for product strategy, code help, research summaries, or turn on web search for
            realtime context with cited sources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass scrollbar-thin flex h-full min-h-[420px] flex-col gap-5 overflow-y-auto rounded-[2rem] p-5">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isStreaming ? (
        <div className="animate-pulse rounded-3xl border border-white/8 bg-white/[0.04] p-5">
          <div className="h-3 w-24 rounded-full bg-slate-600" />
          <div className="mt-4 h-3 w-full rounded-full bg-slate-700/80" />
          <div className="mt-2 h-3 w-2/3 rounded-full bg-slate-700/60" />
        </div>
      ) : null}
      <div ref={bottomRef} />
    </div>
  );
}
