/*
 * Single source of truth for sales numbers. The KPI cards, claim status,
 * target projection and both charts all go through these helpers so they
 * can never disagree with each other.
 */

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatMoney(value: number) {
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Stored gross commission, else selling price x commission rate. */
export function getGross(deal: any): number {
  const stored = Number(deal.gross_commission);
  if (!isNaN(stored) && stored > 0) return stored;

  const price = Number(deal.selling_price) || 0;
  const rate = Number(deal.commission_rate) || 0;
  return (price * rate) / 100;
}

/** Stored net commission, else the gross commission. */
export function getNet(deal: any): number {
  const stored = Number(deal.net_commission);
  if (!isNaN(stored) && stored > 0) return stored;
  return getGross(deal);
}

export function isClaimed(deal: any): boolean {
  return String(deal.remarks ?? "").toLowerCase().trim() === "claimed";
}

export function getClaimed(deal: any): number {
  return isClaimed(deal) ? getGross(deal) : 0;
}

/**
 * Understands "2026-10", "Oct", "October", "OCT 2026" and "October 2026".
 * `year` is null when the value has no year in it.
 */
export function parseClaimMonth(
  value: unknown
): { year: number | null; month: number } | null {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{1,2})/);
  if (iso) {
    const month = Number(iso[2]) - 1;
    return month >= 0 && month < 12
      ? { year: Number(iso[1]), month }
      : null;
  }

  const month = MONTHS.findIndex((m) =>
    text.toLowerCase().startsWith(m.toLowerCase())
  );
  if (month === -1) return null;

  const yearMatch = text.match(/\d{4}/);
  return { year: yearMatch ? Number(yearMatch[0]) : null, month };
}

export function getLatestYear(deals: any[]): number {
  const years = deals
    .map((d) => Number(d.year))
    .filter((y) => !isNaN(y));
  return years.length ? Math.max(...years) : new Date().getFullYear();
}
