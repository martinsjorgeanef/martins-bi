import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows, isFirstBatch, isLastBatch, fileName, totalRows, totalSkipped } = body as {
      rows: { ean: string; fornecedor: string; description: string | null }[];
      isFirstBatch: boolean;
      isLastBatch: boolean;
      fileName: string;
      totalRows: number;
      totalSkipped: number;
    };

    if (isFirstBatch) {
      await prisma.cadgerItem.deleteMany({});
    }

    if (rows.length > 0) {
      await prisma.cadgerItem.createMany({
        data: rows,
        skipDuplicates: true
      });
    }

    if (isLastBatch) {
      await prisma.uploadLog.create({
        data: {
          type: "CADGER",
          sourceName: null,
          fileName,
          rowsProcessed: totalRows,
          rowsCreated: totalRows - totalSkipped,
          rowsUpdated: 0,
          rowsSkipped: totalSkipped
        }
      });
    }

    return NextResponse.json({ success: true, inserted: rows.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao processar o lote do CADGER." }, { status: 500 });
  }
}
