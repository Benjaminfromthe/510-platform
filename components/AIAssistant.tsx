"use client";

import { X } from "lucide-react";
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
  const [hasOpened, setHasOpened] = useState(false);
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

  function openChat() {
    setOpen(true);
    setHasOpened(true);
  }

  return (
    <>
      {open ? (
        <>
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[1px] md:hidden"
          />
          <aside className="animate-fade-up fixed inset-x-0 bottom-0 z-[60] flex h-[60vh] w-full flex-col rounded-t-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl shadow-black/40 md:bottom-20 md:right-5 md:left-auto md:h-[500px] md:w-[380px] md:rounded-3xl md:shadow-2xl md:shadow-black/30">
            <div className="flex items-start justify-between border-b border-[var(--border-color)] px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-300">{t("title")}</p>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">{t("subtitle")}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition hover:border-rose-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => handleQuickReply(reply)}
                  className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-200 transition hover:bg-cyan-400/20"
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
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    : "ml-auto bg-cyan-400 text-slate-950"
                }`}
              >
                <p>{message.content}</p>
                <span className={`mt-1 block text-[10px] ${message.role === "assistant" ? "text-[var(--text-secondary)]" : "text-slate-700"}`}>
                  {message.timestamp}
                </span>
              </article>
            ))}

            {loading ? (
              <article className="max-w-[85%] rounded-2xl bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:240ms]" />
                </div>
                <span className="mt-1 block text-[10px] text-[var(--text-secondary)]">{t("typing")}</span>
              </article>
            ) : null}
            <div ref={bottomRef} />
          </div>

            <form onSubmit={handleSend} className="border-t border-[var(--border-color)] p-3">
            <label className="sr-only" htmlFor="ai-message">{t("placeholder")}</label>
            <div className="flex gap-2">
              <input
                id="ai-message"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, MAX_CHARS))}
                placeholder={t("placeholder")}
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none ring-0 placeholder:text-[var(--text-secondary)] focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={loading || input.trim().length === 0 || input.length > MAX_CHARS}
                className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {t("send")}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-secondary)]">{input.length}/{MAX_CHARS} {t("characters")}</p>
          </form>
          </aside>
        </>
      ) : null}

      <button
        type="button"
        onClick={openChat}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-2xl transition hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 md:right-5 md:bottom-20"
      >
        <span className="text-base">🤖</span>
        <span className="whitespace-nowrap">{t("askAi")}</span>
        {!hasOpened ? <span className="ml-1 h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_0_4px_rgba(248,113,113,0.18)]" /> : null}
      </button>
    </>
  );
}
