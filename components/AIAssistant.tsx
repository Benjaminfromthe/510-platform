"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m 510’s booking assistant in Kigali. I can recommend the best cleaning package for your space and guide you to Book Now.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get a response right now.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply || "I’m here to help." }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <aside className="w-[92vw] max-w-md rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">510 AI assistant</p>
              <h2 className="text-base font-semibold text-white">Need help choosing a service?</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:border-cyan-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === "assistant"
                    ? "bg-slate-800 text-slate-100"
                    : "ml-auto bg-cyan-400 text-slate-950"
                }`}
              >
                {message.content}
              </article>
            ))}

            {loading ? (
              <article className="max-w-[85%] rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-100">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:240ms]" />
                </div>
              </article>
            ) : null}
          </div>

          <form onSubmit={handleSend} className="border-t border-slate-800 p-3">
            <label className="sr-only" htmlFor="ai-message">Type your question</label>
            <div className="flex gap-2">
              <input
                id="ai-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tell me what needs cleaning…"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Send
              </button>
            </div>
          </form>
        </aside>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-3 flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-cyan-400/20 transition hover:bg-cyan-300"
      >
        <span className="text-base">🤖</span>
        Ask 510 AI
      </button>
    </div>
  );
}
