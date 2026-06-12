"use client";

import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext<{ showToast: (message: string, tone?: "info" | "success" | "warning") => void }>({ showToast: () => undefined });

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: "info" | "success" | "warning" } | null>(null);

  const showToast = (message: string, tone: "info" | "success" | "warning" = "info") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2600);
  };

  const toneStyles = {
    info: "border-cyan-400/30 bg-cyan-400/10 text-cyan-50",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-50",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-50",
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <div className="fixed bottom-5 right-5 z-50 animate-[fadeIn_220ms_ease-out]"><div className={`rounded-2xl border px-4 py-3 text-sm shadow-2xl shadow-black/30 ${toneStyles[toast.tone]}`} role="status">{toast.message}</div></div> : null}
    </ToastContext.Provider>
  );
}
