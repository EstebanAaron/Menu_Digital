// export-prices-sheet.ts
import { DISHES } from "../dishes";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SEP = ","; // si al importar en Sheets te queda todo en una columna, cambia a ";"

const HEADERS = [
  "id",
  "price",
  "priceShot",
  "priceGlass",
  "priceHalf",
  "priceWhole",
] as const;

type PriceField = (typeof HEADERS)[number];

function escapeCsv(value: string) {
  if (value.includes('"') || value.includes(",") || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function numOrEmpty(n: unknown): string {
  if (n === null || n === undefined) return "";
  if (typeof n === "number" && Number.isFinite(n)) return String(n);
  return "";
}

function main() {
  // Si hubiese IDs duplicados, nos quedamos con el primero y avisamos
  const seen = new Map<string, (typeof DISHES)[number]>();
  const duplicates: string[] = [];

  for (const d of DISHES) {
    if (seen.has(d.id)) duplicates.push(d.id);
    else seen.set(d.id, d);
  }

  if (duplicates.length) {
    console.warn("⚠️ IDs duplicados en DISHES (revisa):", Array.from(new Set(duplicates)).join(", "));
  }

  const ids = Array.from(seen.keys()).sort((a, b) => a.localeCompare(b));

  const lines: string[] = [];
  lines.push(HEADERS.join(SEP));

  for (const id of ids) {
    const d = seen.get(id)!;

    const row = [
      escapeCsv(id),
      numOrEmpty(d.price),
      numOrEmpty(d.priceShot),
      numOrEmpty(d.priceGlass),
      numOrEmpty(d.priceHalf),
      numOrEmpty(d.priceWhole),
    ].join(SEP);

    lines.push(row);
  }

  const csv = lines.join("\n");

  // Guarda en la raíz del proyecto para que sea fácil encontrarlo
  const outPath = resolve(process.cwd(), "prices-sheet.csv");
  writeFileSync(outPath, csv, "utf-8");

  console.log(`✅ Generado: ${outPath}`);
  console.log("➡️ Importa este CSV en Google Sheets (Archivo → Importar).");
}

main();
