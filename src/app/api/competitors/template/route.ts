import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const fornecedor = req.nextUrl.searchParams.get("fornecedor");

  const workbook = new ExcelJS.Workbook();

  const itensSheet = workbook.addWorksheet("Itens");
  itensSheet.columns = [
    { header: "EAN", key: "ean", width: 18 },
    { header: "DESCRIÇÃO", key: "descricao", width: 50 },
    { header: "VALOR FINAL", key: "valor", width: 16 }
  ];
  itensSheet.getRow(1).font = { bold: true };

  if (fornecedor) {
    const cadgerItems = await prisma.cadgerItem.findMany({
      where: { fornecedor: fornecedor },
      select: { ean: true }
    });
    const eans = cadgerItems.map(function (c) { return c.ean; });

    const products = await prisma.product.findMany({
      where: { ean: { in: eans } },
      select: { ean: true, description: true }
    });

    products
      .sort(function (a, b) { return a.description.localeCompare(b.description); })
      .forEach(function (p) {
        itensSheet.addRow({ ean: p.ean, descricao: p.description, valor: null });
      });
  }

  const printSheet = workbook.addWorksheet("Print Concorrente");
  printSheet.getColumn(1).width = 90;
  printSheet.getCell("A1").value =
    "Cole aqui o print de tela do concorrente (uma imagem geral do pedido/planilha dele). Nao precisa ser por item.";
  printSheet.getCell("A1").font = { italic: true, color: { argb: "FF6B7280" } };
  printSheet.getCell("A1").alignment = { wrapText: true };

  const buffer = await workbook.xlsx.writeBuffer();

  const fileName =
    "modelo_concorrente_" + (fornecedor ? fornecedor.replace(/\s+/g, "_") : "geral") + ".xlsx";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"" + fileName + "\""
    }
  });
}
