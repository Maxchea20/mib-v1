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

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-[#2f5d3a]/10 text-[#2f5d3a] ring-[#2f5d3a]/20",
  warning: "bg-[#9a4b24]/10 text-[#9a4b24] ring-[#9a4b24]/20",
  danger: "bg-[#b42318]/10 text-[#b42318] ring-[#b42318]/20",
  neutral: "bg-[#1c1917]/6 text-[#57534e] ring-[#1c1917]/10",
  info: "bg-[#9a4b24]/10 text-[#9a4b24] ring-[#9a4b24]/20",
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

export function scoreTier(score: number): {
  tone: StatusTone;
  barClass: string;
  textClass: string;
  glowClass: string;
} {
  if (score >= 85) {
    return {
      tone: "success",
      barClass: "bg-[#2f5d3a]",
      textClass: "text-[#2f5d3a]",
      glowClass: "",
    };
  }
  if (score >= 70) {
    return {
      tone: "warning",
      barClass: "bg-[#c46a3a]",
      textClass: "text-[#9a4b24]",
      glowClass: "",
    };
  }
  return {
    tone: "danger",
    barClass: "bg-[#b42318]",
    textClass: "text-[#b42318]",
    glowClass: "",
  };
}
