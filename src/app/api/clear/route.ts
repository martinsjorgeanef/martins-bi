import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  try {
    await prisma.competitorPrice.deleteMany({});
    await prisma.competitorCatalogItem.deleteMany({});
    
    await prisma.product.deleteMany({});
    await prisma.uploadLog.deleteMany({});
    await prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", thresholdPct: 5 },
      update: { thresholdPct: 5 }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao limpar os dados." }, { status: 500 });
  }
}
