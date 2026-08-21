import * as XLSX from "xlsx";
import { ParseResult } from "./parseMartins";

export interface ParsedCompetitorRow {
  ean: string;
  description: string;
  price: number;
}

// Nomes alternativos aceitos pra cada coluna (comparados sem acento e em minúsculo),
// pra cobrir formatos diferentes de concorrente sem quebrar o que já funciona.
const AKA_EAN = ["ean", "codigo ean"];
const AKA_DESCRICAO = ["descricao"];
const AKA_PRECO = ["valor final", "preco nf"];

function normalizarTexto(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().toLowerCase();
}

/**
 * Procura a linha de cabeçalho dentro das primeiras `limite` linhas — cobre tanto o
 * template antigo (cabeçalho na linha 1: EAN / Descrição / Valor final) quanto
 * relatórios com linhas de contexto antes da tabela (ex: "Farmácia: ...", linhas em
 * branco) e nomes de coluna um pouco diferentes (ex: "Código EAN", "Preço NF").
 */
function encontrarCabecalho(linhas: unknown[][], limite = 15): { indice: number; colunas: Map<string, number> } | null {
  for (let i = 0; i < Math.min(limite, linhas.length); i++) {
    const linha = linhas[i] || [];
    const colunas = new Map<string, number>();
    for (let c = 0; c < linha.length; c++) {
      const norm = normalizarTexto(linha[c]);
      if (AKA_EAN.includes(norm)) colunas.set("ean", c);
      else if (AKA_DESCRICAO.includes(norm)) colunas.set("descricao", c);
      else if (AKA_PRECO.includes(norm)) colunas.set("preco", c);
    }
    if (colunas.has("ean") && colunas.has("preco")) {
      return { indice: i, colunas };
    }
  }
  return null;
}

/**
 * Lê a planilha de concorrente. Colunas esperadas (aceita variações de nome):
 *   EAN / Código EAN        -> chave de cruzamento
 *   Descrição               -> descrição do produto (só referência/log)
 *   Valor final / Preço NF  -> preço final do concorrente (após desconto + ICMS/ST),
 *                              comparável ao PrecoUnit da Martins
 *
 * Linhas sem EAN/preço válidos (inclusive a linha "fantasma" que alguns relatórios
 * trazem logo após o cabeçalho) são descartadas silenciosamente e contadas em `skipped`.
 */
export function parseCompetitorFile(buffer: Buffer): ParseResult<ParsedCompetitorRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });

  const cabecalho = encontrarCabecalho(linhas);
  if (!cabecalho) {
    return { rows: [], totalRows: 0, skipped: 0 };
  }

  const { indice, colunas } = cabecalho;
  const idxEan = colunas.get("ean")!;
  const idxPreco = colunas.get("preco")!;
  const idxDescricao = colunas.get("descricao");

  const rows: ParsedCompetitorRow[] = [];
  let skipped = 0;
  let totalRows = 0;

  for (let i = indice + 1; i < linhas.length; i++) {
    const linha = linhas[i];
    if (!linha) continue;
    totalRows++;

    const ean = normalizeEan(linha[idxEan]);
    const price = toNumber(linha[idxPreco]);
    const description = idxDescricao !== undefined && typeof linha[idxDescricao] === "string" ? (linha[idxDescricao] as string).trim() : "";

    if (!ean || price === null || price <= 0) {
      skipped++;
      continue;
    }

    rows.push({ ean, description, price });
  }

  return { rows, totalRows, skipped };
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
  const limpo = String(value).replace(/[^\d,.-]/g, "").trim();
  if (!limpo) return null;
  const semMilhar = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const num = Number(semMilhar);
  return Number.isFinite(num) ? num : null;
}
