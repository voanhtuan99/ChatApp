import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = "Chat App Capstone",
  subtitle = "OpenRouter + Tavily powered AI assistant",
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-teal-300/80">AI Workspace</p>
        <h1 className="mt-1 text-xl font-semibold text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <Link
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-teal-300/30 hover:bg-white/10"
        href="/chat"
      >
        Open chat
      </Link>
    </header>
  );
}
