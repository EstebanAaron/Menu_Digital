import type { Dish } from "./dishes";
import { DISHES } from "./dishes";

const SHEETBEST_URL =
  "https://api.sheetbest.com/sheets/52cc8a8f-0d22-483f-8535-5768920babcd";

const PRICE_FIELDS = ["price", "priceShot", "priceGlass", "priceHalf", "priceWhole"] as const;
type PriceField = (typeof PRICE_FIELDS)[number];

type PriceOverride = Partial<Record<PriceField, number>>;
export type PricesMap = Record<string, PriceOverride>;

function parseNumberStrict(v: unknown): number | undefined {
  // NO null (lo ignoramos)
  if (v === null || v === undefined) return undefined;

  // Sheetbest devuelve "" si está vacío -> ignorar
  if (typeof v === "string" && v.trim() === "") return undefined;

  // normalmente vienen strings numéricas: "2.5"
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;

  if (!Number.isFinite(n)) return undefined;
  if (n < 0) return undefined;

  // opcional: redondear a 2 decimales
  return Math.round(n * 100) / 100;
}

function sanitizeSheetRows(rows: any[], dishes: Dish[]): PricesMap {
  const validIds = new Set(dishes.map((d) => d.id));
  const out: PricesMap = {};

  for (const row of rows) {
    const id = row?.id;
    if (typeof id !== "string") continue;
    if (!validIds.has(id)) continue;

    const o: PriceOverride = {};
    for (const f of PRICE_FIELDS) {
      const n = parseNumberStrict(row?.[f]);
      if (n !== undefined) o[f] = n;
    }

    // Solo guardamos si viene algún número (nunca null)
    if (Object.keys(o).length) out[id] = o;
  }

  return out;
}

export async function fetchPricesMap(): Promise<PricesMap> {
  const res = await fetch(`${SHEETBEST_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch prices: ${res.status}`);

  const rows = await res.json();
  if (!Array.isArray(rows)) return {};

  return sanitizeSheetRows(rows, DISHES);
}

export function applyPriceOverrides(dishes: Dish[], prices: PricesMap): Dish[] {
  return dishes.map((d) => {
    const o = prices[d.id];
    if (!o) return d;
    return { ...d, ...o }; // solo campos de precio (porque o solo tiene esos)
  });
}
