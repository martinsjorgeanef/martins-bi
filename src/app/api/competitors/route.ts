import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.competitorCatalogItem.findMany({
    select: { competitorName: true, fornecedor: true }
  });

  const map = new Map<string, { industries: Set<string>; count: number }>();
  for (const item of items) {
    const entry = map.get(item.competitorName) || { industries: new Set<string>(), count: 0 };
    entry.industries.add(item.fornecedor);
    entry.count++;
    map.set(item.competitorName, entry);
  }

  const competitors = Array.from(map.entries())
    .map(function (entry) {
      return {
        competitorName: entry[0],
        industries: Array.from(entry[1].industries).sort(),
        totalItems: entry[1].count
      };
    })
    .sort(function (a, b) { return a.competitorName.localeCompare(b.competitorName); });

  return NextResponse.json({ competitors: competitors });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const competitorName = body.competitorName as string | undefined;

  if (!competitorName) {
    return NextResponse.json({ error: "Informe o nome do concorrente." }, { status: 400 });
  }

  await prisma.competitorPrice.deleteMany({ where: { competitorName: competitorName } });
  await prisma.competitorCatalogItem.deleteMany({ where: { competitorName: competitorName } });

  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (settings && settings.activeCompetitors) {
    const list = settings.activeCompetitors
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0 && s !== competitorName; });
    await prisma.settings.update({ where: { id: "singleton" }, data: { activeCompetitors: list.join(",") } });
  }

  return NextResponse.json({ success: true });
}
