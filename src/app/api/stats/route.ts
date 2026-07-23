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

  const matchedItems: {
    ean: string;
    description: string;
    diffPct: number;
    category: string | null;
    martinsPrice: number;
  }[] = [];

  for (const p of products) {
    const hasCompetitorData = p.competitorPrices.length > 0;

    if (hasCompetitorData) {
      if (p.category) categoriesSet.add(p.category);
      if (p.supplier) suppliersSet.add(p.supplier);
      for (const c of p.competitorPrices) competitorsSet.add(c.competitorName);
    }

    if (!hasCompetitorData) continue;
    matched++;

    const best = p.competitorPrices.reduce(function (min, c) {
      return c.price < min.price ? c : min;
    });
    const diffPct = calcDiffPct(p.martinsPrice, best.price);
    const status = calcStatus(diffPct, thresholdFraction);
    diffSum += diffPct;

    if (status === "COMPETITIVO") competitive++;
    else if (status === "ATENCAO") attention++;
    else disadvantage++;

    matchedItems.push({
      ean: p.ean,
      description: p.description,
      diffPct: diffPct,
      category: p.category,
      martinsPrice: p.martinsPrice
    });
  }

  const worstSorted = matchedItems.slice().sort(function (a, b) {
    return a.diffPct - b.diffPct;
  });
  const bestSorted = matchedItems.slice().sort(function (a, b) {
    return b.diffPct - a.diffPct;
  });

  const top20Worst = worstSorted.slice(0, 20);
  const top10Best = bestSorted.slice(0, 10);

  const allEans = top20Worst
