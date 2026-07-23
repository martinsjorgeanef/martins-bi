import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcDiffPct, calcStatus } from "@/lib/calculations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const thresholdFraction = (settings?.thresholdPct ?? 5) / 100;

  const products = await prisma.product.findMany({ include: { competitorPrices: true } });

  const categoriesSet = new Set<string>();
  const competitorsSet = new Set<string>();
  const suppliersSet = new Set<string>();

  let matched = 0;
  let competitive = 0;
  let attention = 0;
  let disadvantage = 0;
  let diffSum = 0;

  const worst: { ean: string; description: string; diffPct: number; category: string | null }[] = [];

  for (const p of products) {
    const hasCompetitorData = p.competitorPrices.length > 0;

    if (hasCompetitorData) {
      if (p.category) categoriesSet.add(p.category);
      if (p.supplier) suppliersSet.add(p.supplier);
      for (const c of p.competitorPrices) competitorsSet.add(c.competitorName);
    }

    if (!hasCompetitorData) continue;
    matched++;

    const best = p.competitorPrices.reduce((min, c) => (c.price < min.price ? c : min));
    const diffPct = calcDiffPct(p.martinsPrice, best.price);
    const status = calcStatus(diffPct, thresholdFraction);
    diffSum += diffPct;

    if (status === "COMPETITIVO") competitive++;
    else if (status === "ATENCAO") attention++;
    else disadvantage++;

    worst.push({ ean: p.ean, description: p.description, diffPct, category: p.category });
  }

  worst.sort((a, b) => a.diffPct - b.diffPct);

const top20 = worst.slice(0, 20);
  const top20Eans = top20.map((w) => w.ean);
  const cadgerMatches = await prisma.cadgerItem.findMany({
    where: { ean: { in: top20Eans } },
    select: { ean: true, description: true }
  });
  const longDescByEan = new Map(cadgerMatches.map((c) => [c.ean, c.description]));

  return NextResponse.json({
    totalProducts: matched,
    matchedProducts: matched,
    competitive,
    attention,
    disadvantage,
    avgDiffPct: matched > 0 ? diffSum / matched : null,
    categories: Array.from(categoriesSet).sort(),
    competitorNames: Array.from(competitorsSet).sort(),
    supplierNames: Array.from(suppliersSet).sort(),
    thresholdPct: settings?.thresholdPct ?? 5,
    statusDistribution: [
      { name: "Competitivo", value: competitive, key: "COMPETITIVO" },
      { name: "Negociação pontual", value: attention, key: "ATENCAO" },
      { name: "Desvantagem", value: disadvantage, key: "DESVANTAGEM" }
    ],
    topDisadvantage: top20.map((w) => ({
      ean: w.ean,
      description: longDescByEan.get(w.ean) || w.description,
      category: w.category,
      diffPct: Math.round(w.diffPct * 1000) / 10
    }))
  });
}
