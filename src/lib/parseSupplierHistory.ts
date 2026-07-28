import * as XLSX from "xlsx";

export interface ParsedSupplierHistoryRow {
  mes: string;
  metaVenda: number;
  venda: number;
  clientesAtendidos: number;
}

export function parseSupplierHistoryFile(buffer: Buffer): ParsedSupplierHistoryRow[] {
  var workbook = XLSX.read(buffer, { type: "buffer" });
  var sheetName = workbook.SheetNames[0];
  var sheet = workbook.Sheets[sheetName];
  var rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  if (rows.length < 4) {
    throw new Error("Planilha nao tem o formato esperado (linhas insuficientes).");
  }

  var monthRow = rows[1];
  var totalRow: any[] | null = null;
  for (var i = 2; i < rows.length; i++) {
    var firstCell = rows[i][0];
    if (typeof firstCell === "string" && firstCell.trim().toLowerCase() === "total geral") {
      totalRow = rows[i];
      break;
    }
  }
  if (!totalRow) {
    throw new Error('Nao encontrei a linha "Total geral" na planilha.');
  }

  var result: ParsedSupplierHistoryRow[] = [];
  for (var col = 3; col < monthRow.length; col += 3) {
    var mesRaw = monthRow[col];
    if (mesRaw === undefined || mesRaw === null || mesRaw === "") continue;
    var mes = String(mesRaw).trim();
    if (!/^\d{6}$/.test(mes)) continue;

    var metaVenda = Number(totalRow[col]) || 0;
    var venda = Number(totalRow[col + 1]) || 0;
    var clientes = Number(totalRow[col + 2]) || 0;

    result.push({ mes: mes, metaVenda: metaVenda, venda: venda, clientesAtendidos: Math.round(clientes) });
  }

  if (result.length === 0) {
    throw new Error("Nenhum mes valido foi encontrado na planilha.");
  }

  return result;
}
