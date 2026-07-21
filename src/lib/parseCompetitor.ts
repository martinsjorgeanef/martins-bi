import * as XLSX from "xlsx";
import { ParseResult } from "./parseMartins";

export interface ParsedCompetitorRow {
  ean: string;
  description: string;
  price: number;
}

export function parseCompetitorFile(buffer: Buffer): ParseResult<ParsedCompetitorRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

  const rows: ParsedCompetitorRow[] = [];
  let skipped = 0;

  for (const line of raw) {
    const eanRaw = line["EAN"];
    const priceRaw = line["Valor final"];
    const descRaw = line["Descrição"];

    const ean = normalizeEan(eanRaw);
    const price = toNumber(priceRaw);
    const description = typeof descRaw === "string" ? descRaw.trim() : "";

    if (!ean || price === null || price <= 0) {
      skipped++;
      continue;
    }

    rows.push({ ean, description, price });
  }

  return { rows, totalRows: raw.length, skipped };
}

function normalizeEan(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.round(value).toString();
  }
  const cleaned = String(value).trim().replace(/\D/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(num) ? num : null;
}
