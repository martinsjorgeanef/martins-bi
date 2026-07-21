import * as XLSX from "xlsx";

export interface ParsedMartinsRow {
  ean: string;
  description: string;
  category: string | null;
  supplier: string | null;
  price: number;
}

export interface ParseResult<T> {
  rows: T[];
  totalRows: number;
  skipped: number;
}

export function parseMartinsFile(buffer: Buffer): ParseResult<ParsedMartinsRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

  const rows: ParsedMartinsRow[] = [];
  let skipped = 0;

  for (const line of raw) {
    const eanRaw = line["EAN_CONSUMO"] ?? line["EAN_MARTINS"];
    const priceRaw = line["PrecoUnit"];
    const descRaw = line["DESPRD"];

    const ean = normalizeEan(eanRaw);
    const price = toNumber(priceRaw);
    const description = typeof descRaw === "string" ? descRaw.trim() : "";

    if (!ean || price === null || !description) {
      skipped++;
      continue;
    }

    rows.push({
      ean,
      description,
      category: normalizeText(line["DESCTGPRD"]),
      supplier: normalizeText(line["DESDIVFRN"] ?? line["NOMGRPECOFRN"]),
      price
    });
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

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
