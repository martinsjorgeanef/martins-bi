import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseMartinsFile } from "@/lib/parseMartins";
import { parseCompetitorFile } from "@/lib/parseCompetitor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const sourceName = (formData.get("sourceName") as string | null)?.trim() || null;
    const fornecedorField = (formData.get("fornecedor") as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }
    if (type !== "MARTINS" && type !== "COMPETITOR") {
      return NextResponse.json({ error: "Tipo de upload invalido." }, { status: 400 });
    }
    if (type === "COMPETITOR" && !sourceName) {
      return NextResponse.json({ error: "Informe o nome do distribuidor concorrente." }, { status: 400 });
    }
    if (type === "COMPETITOR" && !fornecedorField) {
      return NextResponse.json(
        { error: "Informe a industria/fornecedor desse lote do concorrente." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let processed = 0;

    if (type === "MARTINS") {
      const parsedMartins = parseMartinsFile(buffer);
      const rows = parsedMartins.rows;
      const totalRows = parsedMartins.totalRows;
      const parseSkipped = parsedMartins.skipped;
      processed = totalRows;
      skipped = parseSkipped;

      if (rows.length === 0) {
        return NextResponse.json(
          {
            error:
              "Nenhuma linha valida foi encontrada nessa planilha de precos da Martins. Nada foi apagado."
          },
          { status: 400 }
        );
      }

      // Substitui totalmente a base da Martins: produtos que nao estao mais nessa
      // planilha sao removidos (junto com os precos de concorrente ligados a eles).
      const newEans = rows.map(function (r) { return r.ean; });
      await prisma.product.deleteMany({ where: { ean: { notIn: newEans } } });

      for (const row of rows) {
        const existing = await prisma.product.findUnique({ where: { ean: row.ean } });
        await prisma.product.upsert({
          where: { ean: row.ean },
          create: {
            ean: row.ean,
            description: row.description,
            category: row.category,
            supplier: row.supplier,
            martinsPrice: row.price,
            martinsUpdatedAt: new Date()
          },
          update: {
            description: row.description,
            category: row.category,
            supplier: row.supplier,
            martinsPrice: row.price,
            martinsUpdatedAt: new Date()
          }
        });
        existing ? updated++ : created++;
      }
    } else {
      const parsedCompetitor = parseCompetitorFile(buffer);
      const rows = parsedCompetitor.rows;
      const totalRows = parsedCompetitor.totalRows;
      const parseSkipped = parsedCompetitor.skipped;
      processed = totalRows;
      skipped = parseSkipped;

      if (rows.length === 0) {
        return NextResponse.json(
          {
            error:
              "Nenhuma linha valida foi encontrada nesse arquivo (verifique se as colunas EAN, Descricao e Valor final existem). Nada foi apagado."
          },
          { status: 400 }
        );
      }

      await prisma.competitorCatalogItem.deleteMany({});
      await prisma.competitorPrice.deleteMany({});

      for (const row of rows) {
        await prisma.competitorCatalogItem.create({
          data: {
            ean: row.ean,
            fornecedor: fornecedorField!,
            competitorName: sourceName!,
            price: row.price
          }
        });
        created++;

        if (row.price === null) continue;

        const product = await prisma.product.findUnique({ where: { ean: row.ean } });
        if (!product) continue;

        await prisma.competitorPrice.create({
          data: { productId: product.id, competitorName: sourceName!, price: row.price }
        });
      }
    }

    await prisma.uploadLog.create({
      data: {
        type: type,
        sourceName: type === "COMPETITOR" ? sourceName : null,
        fileName: file.name,
        rowsProcessed: processed,
        rowsCreated: created,
        rowsUpdated: updated,
        rowsSkipped: skipped
      }
    });

    return NextResponse.json({
      success: true,
      processed: processed,
      created: created,
      updated: updated,
      skipped: skipped,
      fornecedor: fornecedorField
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao processar o arquivo. Verifique se o formato esta correto." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const logs = await prisma.uploadLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ logs });
}
