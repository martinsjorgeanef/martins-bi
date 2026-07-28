import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSupplierHistoryFile } from "@/lib/parseSupplierHistory";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fornecedor = (formData.get("fornecedor") as string | null)?.trim() || "";
    const estado = (formData.get("estado") as string | null)?.trim() || "";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }
    if (!fornecedor) {
      return NextResponse.json({ error: "Selecione o fornecedor." }, { status: 400 });
    }
    if (!estado) {
      return NextResponse.json({ error: "Selecione o estado." }, { status: 400 });
    }

    var lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
      return NextResponse.json({ error: "Envie um arquivo .xlsx ou .xls." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    var parsedRows;
    try {
      parsedRows = parseSupplierHistoryFile(buffer);
    } catch (parseErr: any) {
      return NextResponse.json({ error: parseErr.message || "Erro ao ler a planilha." }, { status: 400 });
    }

    var created = 0;
    var updated = 0;

    for (const row of parsedRows) {
      const existing = await prisma.supplierHistory.findUnique({
        where: {
          fornecedor_estado_mes: {
            fornecedor: fornecedor,
            estado: estado,
            mes: row.mes
          }
        }
      });

      await prisma.supplierHistory.upsert({
        where: {
          fornecedor_estado_mes: {
            fornecedor: fornecedor,
            estado: estado,
            mes: row.mes
          }
        },
        update: {
          metaVenda: row.metaVenda,
          venda: row.venda,
          clientesAtendidos: row.clientesAtendidos
        },
        create: {
          fornecedor: fornecedor,
          estado: estado,
          mes: row.mes,
          metaVenda: row.metaVenda,
          venda: row.venda,
          clientesAtendidos: row.clientesAtendidos
        }
      });

      if (existing) {
        updated++;
      } else {
        created++;
      }
    }

    return NextResponse.json({ success: true, created: created, updated: updated, totalMonths: parsedRows.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao processar o arquivo." }, { status: 500 });
  }
}
