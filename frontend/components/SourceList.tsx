"use client";

import { ExternalLink, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { Source } from "@/lib/types";

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!activeSource) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSource(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeSource]);

  if (sources.length === 0) return null;

  return (
    <>
      <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/30 p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">Sources</p>
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div
              key={source.url}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
            >
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 overflow-hidden text-sm text-slate-100 transition hover:text-teal-200"
              >
                <span className="mr-2 text-slate-400">[{index + 1}]</span>
                <span className="inline-block max-w-full truncate align-bottom">{source.title}</span>
              </a>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-teal-300/30 hover:text-white"
                >
                  <ExternalLink size={13} />
                  Link
                </a>
                <button
                  type="button"
                  onClick={() => setActiveSource(source)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-teal-300/30 hover:text-white"
                >
                  <Eye size={13} />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {mounted && activeSource
        ? createPortal(
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
              onClick={() => setActiveSource(null)}
            >
              <div
                className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0e1728] p-5 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Citation Preview</p>
                    <h3 className="mt-2 text-base font-semibold text-white">{activeSource.title}</h3>
                    <a
                      href={activeSource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs text-teal-200/90 hover:text-teal-100"
                    >
                      {activeSource.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSource(null)}
                    className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-white/8 bg-slate-950/40 p-4 text-sm leading-7 text-slate-200">
                  {activeSource.snippet || "No preview snippet available."}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
