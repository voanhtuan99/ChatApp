"use client";

import { LoaderCircle, Send, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onClear: () => void;
  useWebSearch: boolean;
  onToggleWebSearch: (nextValue: boolean) => void;
  disabled?: boolean;
}

export function ChatInput({
  onSubmit,
  onClear,
  useWebSearch,
  onToggleWebSearch,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    const maxHeight = 96;
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
  };

  const submit = () => {
    const nextMessage = message.trim();
    if (!nextMessage || disabled) return;
    onSubmit(nextMessage);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="glass shrink-0 rounded-[2rem] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <span
            className={`relative h-6 w-11 rounded-full transition ${useWebSearch ? "bg-teal-400/90" : "bg-slate-700"}`}
          >
            <input
              checked={useWebSearch}
              className="sr-only"
              onChange={(event) => onToggleWebSearch(event.target.checked)}
              type="checkbox"
            />
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${useWebSearch ? "left-6" : "left-1"}`}
            />
          </span>
          Use Web Search
        </label>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-rose-300/30 hover:text-white"
          onClick={onClear}
          type="button"
        >
          <Trash2 size={16} />
          Clear chat
        </button>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <textarea
          ref={textareaRef}
          rows={1}
          className="no-scrollbar h-12 max-h-24 min-h-12 flex-1 resize-none overflow-y-auto rounded-[1.5rem] border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300/30"
          disabled={disabled}
          onChange={(event) => {
            setMessage(event.target.value);
            resizeTextarea(event.target);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Message the assistant..."
          value={message}
        />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] bg-teal-400 px-5 py-4 font-medium text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 md:min-w-40"
          disabled={disabled}
          onClick={submit}
          type="button"
        >
          {disabled ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />}
          {disabled ? "Sending" : "Send"}
        </button>
      </div>
    </div>
  );
}
