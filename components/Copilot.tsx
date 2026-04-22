"use client";

import { useEffect, useRef, useState } from "react";
import type { Ad } from "@/lib/mockAds";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Which ad should I kill first and why?",
  "Give me a 7-day spend plan.",
  "What angle would beat my top performer?",
];

export function Copilot({ ads }: { ads: Ad[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I've got your synced ads. Ask me what to scale, what to kill, or how to spend next week.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || sending) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, ads }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "(no reply)" },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: e instanceof Error ? e.message : "Something went wrong.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-glow hover:brightness-110"
      >
        <ChatIcon />
        {open ? "Close Copilot" : "Ask Copilot"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[min(560px,80vh)] w-[min(400px,92vw)] flex-col overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#0c0e14]/95 shadow-2xl backdrop-blur-xl animate-fade-up">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6">
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 blur-sm opacity-70" />
                <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 text-[10px] font-bold text-white">
                  AI
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Copilot</div>
                <div className="text-[10px] text-zinc-500">Grounded on {ads.length} live ads</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-white text-black"
                    : "bg-white/5 text-zinc-100 ring-1 ring-inset ring-white/5"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="max-w-[85%] rounded-2xl bg-white/5 px-3 py-2 text-sm text-zinc-400 ring-1 ring-inset ring-white/5">
                <span className="inline-flex items-center gap-1">
                  <Dot delay={0} />
                  <Dot delay={120} />
                  <Dot delay={240} />
                </span>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-white/5 px-4 py-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-200 hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-white/5 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your ads..."
              className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-400/50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-gradient inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.4 20.6 22 12 3.4 3.4l-.4 7L17 12 3 13.6z" />
    </svg>
  );
}
