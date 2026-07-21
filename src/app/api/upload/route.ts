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
    const type = formData.get("type") as string | null; // "MARTINS" | "COMPETITOR"
    const sourceName = (formData.get("sourceName") as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }
    if (type !== "MARTINS" && type !== "COMPETITOR") {
      return NextResponse.json({ error: "Tipo de upload inválido." }, { status: 400 });
    }
    if (type === "COMPETITOR" && !sourceName) {
      return NextResponse.json(
        { error: "Informe o nome do distribuidor concorrente." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let processed = 0;

    if (type === "MARTINS") {
      const { rows, totalRows, skipped: parseSkipped } = parseMartinsFile(buffer);
      processed = totalRows;
      skipped = parseSkipped;

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
      const { rows, totalRows, skipped: parseSkipped } = parseCompetitorFile(buffer);
      processed = totalRows;
      skipped = parseSkipped;

      for (const row of rows) {
        const product = await prisma.product.findUnique({ where: { ean: row.ean } });
        if (!product) {
          skipped++;
          continue;
        }

        const existing = await prisma.competitorPrice.findUnique({
          where: {
            productId_competitorName: {
              productId: product.id,
              competitorName: sourceName!
            }
          }
        });

        await prisma.competitorPrice.upsert({
          where: {
            productId_competitorName: {
              productId: product.id,
              competitorName: sourceName!
            }
          },
          create: {
            productId: product.id,
            competitorName: sourceName!,
            price: row.price
          },
          update: {
            price: row.price
          }
        });
        existing ? updated++ : created++;
      }
    }

    await prisma.uploadLog.create({
      data: {
        type,
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
      processed,
      created,
      updated,
      skipped
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao processar o arquivo. Verifique se o formato está correto." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const logs = await prisma.uploadLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20
  });
  return NextResponse.json({ logs });
}
