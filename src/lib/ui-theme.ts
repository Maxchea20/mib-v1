// File: src/lib/ui-theme.ts
export type StatusTone = "success" | "warning" | "danger" | "neutral" | "info";

const STATUS_TONE_MAP: Record<string, StatusTone> = {
  Available: "success",
  Closed: "success",
  Sold: "success",
  Rented: "success",
  Booked: "warning",
  Pending: "warning",
  Inactive: "neutral",
  "Fell Through": "danger",
  Cancelled: "danger",
};

// Dark-mode badge classes - bright text on a dim tinted background, thin matching ring
const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-[#22c55e]/10 text-[#4ade80] ring-[#22c55e]/25",
  warning: "bg-[#fbbf24]/10 text-[#fcd34d] ring-[#fbbf24]/25",
  danger: "bg-[#ff4d4d]/10 text-[#ff7a7a] ring-[#ff4d4d]/25",
  neutral: "bg-white/[0.06] text-[#8b95a5] ring-white/10",
  info: "bg-[#22d3ee]/10 text-[#67e3f9] ring-[#22d3ee]/25",
};

export function toneForStatus(status: string | null | undefined): StatusTone {
  if (!status) return "neutral";
  return STATUS_TONE_MAP[status] ?? "neutral";
}

export function badgeClassesForStatus(status: string | null | undefined): string {
  return TONE_CLASSES[toneForStatus(status)];
}

export function badgeClassesForTone(tone: StatusTone): string {
  return TONE_CLASSES[tone];
}

// Score tiers - bright terminal-style colors
export function scoreTier(score: number): {
  tone: StatusTone;
  barClass: string;
  textClass: string;
  glowClass: string;
} {
  if (score >= 85) {
    return {
      tone: "success",
      barClass: "bg-[#22c55e]",
      textClass: "text-[#4ade80]",
      glowClass: "shadow-[0_0_8px_rgba(34,197,94,0.5)]",
    };
  }
  if (score >= 70) {
    return {
      tone: "warning",
      barClass: "bg-[#fbbf24]",
      textClass: "text-[#fcd34d]",
      glowClass: "shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    };
  }
  return {
    tone: "danger",
    barClass: "bg-[#ff4d4d]",
    textClass: "text-[#ff7a7a]",
    glowClass: "shadow-[0_0_8px_rgba(255,77,77,0.5)]",
  };
}
