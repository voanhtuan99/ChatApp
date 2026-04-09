"use client";

import type { ReactNode } from "react";
import { useState } from "react";

interface CodeBlockProps {
  className?: string;
  children?: ReactNode;
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? "").replace(/\n$/, "");

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative">
      <button
        className="absolute right-3 top-3 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs text-slate-200 transition hover:border-teal-300/40 hover:text-white"
        onClick={copy}
        type="button"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className={className}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
