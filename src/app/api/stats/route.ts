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
    if (p.category) categoriesSet.add(p.category);
    if (p.supplier && p.competitorPrices.length > 0) suppliersSet.add(p.supplier);
    for (const c of p.competitorPrices) competitorsSet.add(c.competitorName);

    if (p.competitorPrices.length === 0) continue;
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

  return NextResponse.json({
    totalProducts: products.length,
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
    topDisadvantage: worst.slice(0, 8).map((w) => ({
      ean: w.ean,
      description: w.description.length > 18 ? w.description.slice(0, 18) + "…" : w.description,
      diffPct: Math.round(w.diffPct * 1000) / 10
    }))
  });
}
