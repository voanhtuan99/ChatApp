import type { Source } from "@/lib/types";

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/30 p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">Sources</p>
      <div className="space-y-3">
        {sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-teal-300/25 hover:bg-white/[0.05]"
          >
            <p className="text-sm font-medium text-white">{source.title}</p>
            <p className="mt-1 truncate text-xs text-teal-200/80">{source.url}</p>
            <p className="mt-2 text-sm text-slate-300">{source.snippet}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
