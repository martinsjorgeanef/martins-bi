import * as XLSX from "xlsx";
import { ParseResult } from "./parseMartins";

export interface ParsedCompetitorRow {
  ean: string;
  description: string;
  price: number | null;
}

function normalizeHeader(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

function findColumnIndexes(headerRow: unknown[]): { ean: number; desc: number; price: number } {
  var eanIdx = -1;
  var descIdx = -1;
  var priceIdx = -1;

  for (var i = 0; i < headerRow.length; i++) {
    var raw = headerRow[i];
    if (typeof raw !== "string") continue;
    var norm = normalizeHeader(raw);

    if (eanIdx === -1 && norm.indexOf("EAN") !== -1) {
      eanIdx = i;
    }
    if (descIdx === -1 && norm.indexOf("DESCRI") !== -1 && norm.indexOf("OFERTA") === -1) {
      descIdx = i;
    }
    if (priceIdx === -1 && norm.indexOf("VALOR FINAL") !== -1) {
      priceIdx = i;
    }
  }

  return { ean: eanIdx, desc: descIdx, price: priceIdx };
}

function findHeaderRow(allRows: unknown[][]): { rowIndex: number; cols: { ean: number; desc: number; price: number } } | null {
  var limit = Math.min(allRows.length, 15);
  for (var r = 0; r < limit; r++) {
    var cols = findColumnIndexes(allRows[r]);
    if (cols.ean !== -1 && cols.price !== -1) {
      return { rowIndex: r, cols: cols };
    }
  }
  return null;
}

export function parseCompetitorFile(buffer: Buffer): ParseResult<ParsedCompetitorRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const allRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  const rows: ParsedCompetitorRow[] = [];
  let skipped = 0;

  const headerInfo = findHeaderRow(allRows);
  if (!headerInfo) {
    return { rows: [], totalRows: 0, skipped: allRows.length };
  }

  var eanIdx = headerInfo.cols.ean;
  var descIdx = headerInfo.cols.desc;
  var priceIdx = headerInfo.cols.price;
  var dataRows = allRows.slice(headerInfo.rowIndex + 1);

  for (const line of dataRows) {
    var eanRaw = line[eanIdx];
    var descRaw = descIdx !== -1 ? line[descIdx] : null;
    var priceRaw = line[priceIdx];

    var ean = normalizeEan(eanRaw);
    var description = typeof descRaw === "string" ? descRaw.trim() : "";

    if (!ean) {
      skipped++;
      continue;
    }

    var price = toNumber(priceRaw);

    rows.push({ ean: ean, description: description, price: price !== null && price > 0 ? price : null });
  }

  return { rows: rows, totalRows: dataRows.length, skipped: skipped };
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
