type ServiceCategory = "ELECTRONICS" | "FURNITURE" | "OTHER";

export default function ServiceIllustration({
  category,
  className = "h-32 w-full",
}: {
  category: ServiceCategory;
  className?: string;
}) {
  if (category === "ELECTRONICS") {
    return (
      <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="screenGlow" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect x="18" y="20" width="98" height="58" rx="10" fill="#111827" stroke="#334155" strokeWidth="2" />
        <rect x="28" y="30" width="78" height="38" rx="6" fill="url(#screenGlow)" opacity="0.95" />
        <rect x="32" y="74" width="70" height="8" rx="4" fill="#1f2937" />
        <rect x="40" y="84" width="54" height="6" rx="3" fill="#334155" opacity="0.8" />
        <rect x="60" y="88" width="12" height="8" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
      </svg>
    );
  }

  if (category === "FURNITURE") {
    return (
      <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
        <rect x="18" y="52" width="124" height="30" rx="14" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
        <rect x="28" y="38" width="26" height="18" rx="8" fill="#e5e7eb" stroke="#374151" strokeWidth="2" />
        <rect x="58" y="32" width="26" height="24" rx="10" fill="#e5e7eb" stroke="#374151" strokeWidth="2" />
        <rect x="88" y="38" width="26" height="18" rx="8" fill="#e5e7eb" stroke="#374151" strokeWidth="2" />
        <rect x="24" y="56" width="18" height="14" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
        <rect x="118" y="56" width="18" height="14" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
        <rect x="44" y="62" width="72" height="10" rx="5" fill="#9ca3af" opacity="0.75" />
        <path d="M30 82 H130" stroke="#374151" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
      <rect x="52" y="24" width="54" height="62" rx="14" fill="#0ea5e9" opacity="0.95" stroke="#38bdf8" strokeWidth="2" />
      <rect x="60" y="32" width="38" height="14" rx="7" fill="#eff6ff" opacity="0.9" />
      <rect x="64" y="48" width="30" height="18" rx="9" fill="#e0f2fe" opacity="0.95" />
      <path d="M76 44 C92 30, 108 34, 112 50" fill="none" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
      <path d="M54 72 C38 76, 34 94, 44 102" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
      <path d="M104 72 C120 76, 124 94, 114 102" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="44" cy="38" r="8" fill="#ffffff" opacity="0.45" />
      <circle cx="104" cy="56" r="6" fill="#ffffff" opacity="0.35" />
      <circle cx="88" cy="86" r="7" fill="#ffffff" opacity="0.4" />
    </svg>
  );
}
