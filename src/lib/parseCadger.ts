import * as XLSX from "xlsx";
import { ParseResult } from "./parseMartins";

export interface ParsedCadgerRow {
  ean: string;
  fornecedor: string;
  description: string | null;
}

export function parseCadgerFile(buffer: Buffer): ParseResult<ParsedCadgerRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    range: 3
  });

  const rows: ParsedCadgerRow[] = [];
  let skipped = 0;

  for (const line of raw) {
    const eanRaw = line["EAN-13"];
    const fornecedorRaw = line["Fornecedor"];
    const descRaw = line["Descrição Alongada"];

    const ean = normalizeEan(eanRaw);
    const fornecedor = typeof fornecedorRaw === "string" ? fornecedorRaw.trim() : "";

    if (!ean || !fornecedor) {
      skipped++;
      continue;
    }

    rows.push({
      ean,
      fornecedor,
      description: typeof descRaw === "string" && descRaw.trim() ? descRaw.trim() : null
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
