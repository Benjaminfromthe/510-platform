"use client";

import { MessageCircleMore } from "lucide-react";
import { useTranslations } from "next-intl";

export default function WhatsAppFloat() {
  const t = useTranslations("ui");
  const whatsappMessage = "Hello 510 Cleaning Services! I would like to book a cleaning service.";

  return (
    <a
      href={`https://wa.me/250787769046?text=${encodeURIComponent(whatsappMessage)}`}
      target="_blank"
      rel="noreferrer"
      aria-label={t("whatsappTooltip")}
      title={t("whatsappTooltip")}
      className="group fixed bottom-4 left-4 z-40 hidden md:inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500 p-3 text-white shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400"
    >
      <MessageCircleMore className="h-5 w-5" />
      <span className="ml-2 hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-200 group-hover:max-w-[8rem] group-hover:opacity-100 md:inline-block md:group-hover:max-w-[8rem]">
        {t("whatsappLabel")}
      </span>
    </a>
  );
}
