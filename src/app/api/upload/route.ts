import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { parseMartinsFile } from "@/lib/parseMartins";
import { parseCompetitorFile } from "@/lib/parseCompetitor";

export const runtime = "nodejs";
export const maxDuration = 60;

async function extractPrintImage(buffer: Buffer): Promise<{ data: Buffer; mimeType: string } | null> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const media = workbook.model.media as Array<{ type: string; buffer: ArrayBuffer | Buffer; extension: string }>;
    if (!media || media.length === 0) return null;

    const img = media[0];
    const ext = (img.extension || "png").toLowerCase();
    const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "gif" ? "image/gif" : "image/png";
    const data = Buffer.isBuffer(img.buffer) ? img.buffer : Buffer.from(img.buffer as ArrayBuffer);

    return { data, mimeType };
  } catch (err) {
    console.error("Falha ao extrair print da planilha (ignorado):", err);
    return null;
  }
}

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
    let printSaved = false;

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

      const oldItems = await prisma.competitorCatalogItem.findMany({
        where: { fornecedor: fornecedorField!, competitorName: sourceName! },
        select: { ean: true }
      });
      const oldEans = oldItems.map(function (o) { return o.ean; });

      if (oldEans.length > 0) {
        const oldProducts = await prisma.product.findMany({
          where: { ean: { in: oldEans } },
          select: { id: true }
        });
        const oldProductIds = oldProducts.map(function (p) { return p.id; });
        if (oldProductIds.length > 0) {
          await prisma.competitorPrice.deleteMany({
            where: { productId: { in: oldProductIds }, competitorName: sourceName! }
          });
        }
      }

      await prisma.competitorCatalogItem.deleteMany({
        where: { fornecedor: fornecedorField!, competitorName: sourceName! }
      });

      for (const row of rows) {
        await prisma.competitorCatalogItem.upsert({
          where: { ean_competitorName: { ean: row.ean, competitorName: sourceName! } },
          create: { ean: row.ean, fornecedor: fornecedorField!, competitorName: sourceName!, price: row.price },
          update: { fornecedor: fornecedorField!, price: row.price }
        });
        created++;

        if (row.price === null) continue;

        const product = await prisma.product.findUnique({ where: { ean: row.ean } });
        if (!product) continue;

        await prisma.competitorPrice.upsert({
          where: { productId_competitorName: { productId: product.id, competitorName: sourceName! } },
          create: { productId: product.id, competitorName: sourceName!, price: row.price },
          update: { price: row.price }
        });
      }

      const printImage = await extractPrintImage(buffer);
      if (printImage) {
        await prisma.competitorPrint.upsert({
          where: { fornecedor_competitorName: { fornecedor: fornecedorField!, competitorName: sourceName! } },
          create: {
            fornecedor: fornecedorField!,
            competitorName: sourceName!,
            imageData: printImage.data,
            mimeType: printImage.mimeType
          },
          update: {
            imageData: printImage.data,
            mimeType: printImage.mimeType
          }
        });
        printSaved = true;
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
      fornecedor: fornecedorField,
      printSaved: printSaved
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
