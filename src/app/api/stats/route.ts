import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcDiffPct, calcStatus, calcRequiredDiscountPct } from "@/lib/calculations";

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
  let recoveryDiscountSum = 0;
  let recoveryGreen = 0;
  let recoveryYellow = 0;
  let recoveryRed = 0;

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

    if (status === "COMPETITIVO") {
      competitive++;
    } else if (status === "ATENCAO") {
      attention++;
    } else {
      disadvantage++;
      var requiredDiscount = calcRequiredDiscountPct(p.martinsPrice, best.price, thresholdFraction);
      recoveryDiscountSum += requiredDiscount;
      if (requiredDiscount * 100 <= 2) {
        recoveryGreen++;
      } else if (requiredDiscount * 100 <= 5) {
        recoveryYellow++;
      } else {
        recoveryRed++;
      }
    }

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

  const allEans = top20Worst
    .map(function (w) {
      return w.ean;
    })
    .concat(
      bestSorted.slice(0, 100).map(function (w) {
        return w.ean;
      })
    );

  const cadgerMatches = await prisma.cadgerItem.findMany({
    where: { ean: { in: allEans } },
    select: { ean: true, description: true }
  });
  const longDescByEan = new Map(
    cadgerMatches.map(function (c) {
      return [c.ean, c.description];
    })
  );

  return NextResponse.json({
    totalProducts: matched,
    matchedProducts: matched,
    competitive: competitive,
    attention: attention,
    disadvantage: disadvantage,
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
    topDisadvantage: top20Worst.map(function (w) {
      return {
        ean: w.ean,
        description: longDescByEan.get(w.ean) || w.description,
        category: w.category,
        diffPct: Math.round(w.diffPct * 1000) / 10
      };
    }),
    recoveryPotential: disadvantage > 0
      ? {
          avgDiscountPct: Math.round((recoveryDiscountSum / disadvantage) * 1000) / 10,
          itemsRecoverable: disadvantage,
          oldCompetitivePct: matched > 0 ? Math.round((competitive / matched) * 1000) / 10 : 0,
          newCompetitivePct: matched > 0 ? Math.round(((competitive + disadvantage) / matched) * 1000) / 10 : 0,
          green: recoveryGreen,
          yellow: recoveryYellow,
          red: recoveryRed
        }
      : null,
    topAdvantage: bestSorted.slice(0, 100).map(function (w) {
      return {
        ean: w.ean,
        description: longDescByEan.get(w.ean) || w.description,
        category: w.category,
        diffPct: Math.round(w.diffPct * 1000) / 10,
        martinsPrice: w.martinsPrice
      };
    })
  });
}
