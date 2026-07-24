import * as XLSX from "xlsx";
import { ParseResult } from "./parseMartins";

export interface ParsedCompetitorRow {
  ean: string;
  description: string;
  price: number | null;
}

var EAN_COLUMN_CANDIDATES = ["EAN", "Código EAN", "Codigo EAN", "COD EAN", "Cod EAN", "EAN13", "EAN 13"];

function findEanValue(line: Record<string, unknown>): unknown {
  for (var i = 0; i < EAN_COLUMN_CANDIDATES.length; i++) {
    var key = EAN_COLUMN_CANDIDATES[i];
    if (line[key] !== undefined && line[key] !== null && line[key] !== "") {
      return line[key];
    }
  }
  // Fallback: procura qualquer coluna cujo nome contenha "EAN"
  var keys = Object.keys(line);
  for (var j = 0; j < keys.length; j++) {
    if (keys[j].toUpperCase().indexOf("EAN") !== -1) {
      var value = line[keys[j]];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }
  return null;
}

export function parseCompetitorFile(buffer: Buffer): ParseResult<ParsedCompetitorRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

  const rows: ParsedCompetitorRow[] = [];
  let skipped = 0;

  for (const line of raw) {
    const eanRaw = findEanValue(line);
    const priceRaw = line["Valor final"];
    const descRaw = line["Descrição"];

    const ean = normalizeEan(eanRaw);
    const description = typeof descRaw === "string" ? descRaw.trim() : "";

    if (!ean || !description) {
      skipped++;
      continue;
    }

    const price = toNumber(priceRaw);

    rows.push({ ean: ean, description: description, price: price !== null && price > 0 ? price : null });
  }

  return { rows: rows, totalRows: raw.length, skipped: skipped };
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
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  var cleaned = String(value)
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}
