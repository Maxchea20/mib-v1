import { parseNumber } from "./housingLoan";

/*
| Reads what a visitor typed into an amount box.
|   blank    -> nothing typed
|   negative -> starts with a minus sign
|   invalid  -> letters, 1e5, two decimal points ...
|   ok       -> a plain number ("RM 1,250.50" is accepted)
*/
export type AmountKind = "blank" | "negative" | "invalid" | "ok";

export function readAmount(text: string): { kind: AmountKind; value: number } {
  const trimmed = text.trim();
  if (trimmed === "") return { kind: "blank", value: NaN };

  const stripped = trimmed.replace(/RM/gi, "").replace(/[,\s]/g, "");
  if (/^-\d*\.?\d+$/.test(stripped)) return { kind: "negative", value: NaN };

  const value = parseNumber(text);
  return Number.isFinite(value) ? { kind: "ok", value } : { kind: "invalid", value: NaN };
}

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
