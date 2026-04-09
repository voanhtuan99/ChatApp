"use client";

import { MessageSquarePlus } from "lucide-react";

import { cn, formatRelativeTime } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
}: SidebarProps) {
  return (
    <aside className="glass flex h-full min-h-[720px] w-full max-w-xs flex-col rounded-[2rem] p-4">
      <button
        className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] bg-white/8 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
        onClick={onCreateConversation}
        type="button"
      >
        <MessageSquarePlus size={18} />
        New conversation
      </button>
      <div className="mt-5">
        <p className="px-2 text-xs uppercase tracking-[0.24em] text-slate-500">Recent chats</p>
      </div>
      <div className="scrollbar-thin mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            className={cn(
              "w-full rounded-[1.3rem] border px-4 py-3 text-left transition",
              conversation.id === activeConversationId
                ? "border-teal-300/30 bg-teal-400/10"
                : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]",
            )}
            onClick={() => onSelectConversation(conversation.id)}
            type="button"
          >
            <p className="truncate text-sm font-medium text-white">{conversation.title}</p>
            <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(conversation.updatedAt)}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
