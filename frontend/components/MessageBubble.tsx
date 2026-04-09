"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/ui/CodeBlock";
import { SourceList } from "@/components/SourceList";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-3xl rounded-[1.75rem] border px-5 py-4 shadow-xl",
          isUser
            ? "border-teal-300/20 bg-teal-400/10 text-teal-50"
            : "border-white/8 bg-white/[0.04] text-slate-100",
        )}
      >
        <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          <span>{isUser ? "You" : "Assistant"}</span>
          {message.isStreaming ? <span className="text-teal-300">Streaming</span> : null}
          {message.error ? <span className="text-rose-300">Error</span> : null}
        </div>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
        ) : (
          <div className="prose prose-invert max-w-none text-sm leading-7">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code(props) {
                  const { className, children } = props;
                  const isInline = !className;
                  if (isInline) {
                    return <code className={className}>{children}</code>;
                  }
                  return <CodeBlock className={className}>{children}</CodeBlock>;
                },
              }}
            >
              {message.content || "Thinking..."}
            </ReactMarkdown>
          </div>
        )}
        {message.sources?.length ? <SourceList sources={message.sources} /> : null}
      </div>
    </div>
  );
}
