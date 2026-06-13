"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function AIAssistant() {
  const t = useTranslations("chat");
  const quickReplies = [
    t("quickReplies.whatDoYouClean"),
    t("quickReplies.howDoIBook"),
    t("quickReplies.subscriptions"),
    t("quickReplies.coverage"),
  ];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: t("welcome"),
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const MAX_CHARS = 500;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed || loading || trimmed.length > MAX_CHARS) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const nextMessages = [...messages, { role: "user" as const, content: trimmed, timestamp }];
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

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply || t("fallback"),
          timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : t("error"),
          timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickReply(reply: string) {
    setInput(reply);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <aside className="w-[92vw] max-w-md rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{t("title")}</p>
              <h2 className="text-base font-semibold text-white">{t("subtitle")}</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:border-cyan-400 hover:text-white"
            >
              {t("close")}
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => handleQuickReply(reply)}
                  className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  {reply}
                </button>
              ))}
            </div>
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === "assistant"
                    ? "bg-slate-800 text-slate-100"
                    : "ml-auto bg-cyan-400 text-slate-950"
                }`}
              >
                <p>{message.content}</p>
                <span className={`mt-1 block text-[10px] ${message.role === "assistant" ? "text-slate-400" : "text-slate-700"}`}>
                  {message.timestamp}
                </span>
              </article>
            ))}

            {loading ? (
              <article className="max-w-[85%] rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:240ms]" />
                </div>
                <span className="mt-1 block text-[10px] text-slate-400">{t("typing")}</span>
              </article>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-slate-800 p-3">
            <label className="sr-only" htmlFor="ai-message">{t("placeholder")}</label>
            <div className="flex gap-2">
              <input
                id="ai-message"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, MAX_CHARS))}
                placeholder={t("placeholder")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={loading || input.trim().length === 0 || input.length > MAX_CHARS}
                className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {t("send")}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">{input.length}/{MAX_CHARS} {t("characters")}</p>
          </form>
        </aside>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-3 flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-cyan-400/20 transition hover:bg-cyan-300"
      >
        <span className="text-base">🤖</span>
        {t("askAi")}
      </button>
    </div>
  );
}
