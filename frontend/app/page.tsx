import Link from "next/link";

import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-6">
      <div className="glass overflow-hidden rounded-[2.5rem]">
        <Header title="Chat App Capstone" subtitle="Modern AI chat with OpenRouter, Tavily, and streaming UX" />
        <section className="grid gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-16">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-teal-300/80">Production-ready starter</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight text-white">
              A clean full-stack AI chat architecture built for shipping and scaling.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              Separate frontend and backend, realtime streaming, optional web search with sources,
              and a structure ready for RAG, auth, and persistent chat history.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                className="rounded-full bg-teal-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-teal-300"
                href="/chat"
              >
                Launch chat
              </Link>
              <a
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
                href="#features"
              >
                Explore features
              </a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/30 p-6">
            <p className="text-sm font-medium text-white">Highlights</p>
            <div className="mt-6 grid gap-4">
              {[
                "Next.js App Router + Tailwind UI",
                "FastAPI service layer with OpenRouter fallback",
                "Tavily-backed web search and source citations",
                "SSE streaming from backend to frontend",
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="features" className="border-t border-white/10 px-6 py-10 lg:px-10">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Modern chat UX",
                copy: "Responsive two-pane layout, markdown rendering, code copy button, and elegant empty states.",
              },
              {
                title: "Reliable backend orchestration",
                copy: "Prompt construction, search summarization, error handling, timeouts, and service separation are built in.",
              },
              {
                title: "Ready for the next phase",
                copy: "The structure leaves clear extension points for RAG, database sessions, auth, and observability.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.copy}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
