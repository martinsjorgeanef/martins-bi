import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcDiffPct, calcStatus, priorityForCompetitivePct } from "@/lib/calculations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CategoryAgg {
  category: string;
  monitored: number;
  competitive: number;
  attention: number;
  disadvantage: number;
  disadvantageDiffSum: number;
}

function summaryFor(pct: number): string {
  if (pct >= 85) return "Categoria saudável, sem necessidade de ação imediata.";
  if (pct >= 70) return "Competitividade dentro do aceitável, mas vale acompanhar de perto os itens em desvantagem.";
  return "Categoria abaixo da meta de competitividade. Priorizar negociação dos principais itens.";
}

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const thresholdFraction = (settings?.thresholdPct ?? 5) / 100;

  const products = await prisma.product.findMany({ include: { competitorPrices: true } });

  const map = new Map<string, CategoryAgg>();

  for (const p of products) {
    if (p.competitorPrices.length === 0) continue;
    const category = p.category || "Sem categoria";
    const entry =
      map.get(category) ?? { category, monitored: 0, competitive: 0, attention: 0, disadvantage: 0, disadvantageDiffSum: 0 };
    entry.monitored++;

    const best = p.competitorPrices.reduce((min, c) => (c.price < min.price ? c : min));
    const diffPct = calcDiffPct(p.martinsPrice, best.price);
    const status = calcStatus(diffPct, thresholdFraction);

    if (status === "COMPETITIVO") entry.competitive++;
    else if (status === "ATENCAO") entry.attention++;
    else {
      entry.disadvantage++;
      entry.disadvantageDiffSum += -diffPct;
    }

    map.set(category, entry);
  }

  const categories = Array.from(map.values())
    .map((c) => {
      const competitivePct = c.monitored > 0 ? Math.round((c.competitive / c.monitored) * 1000) / 10 : 0;
      const avgDisadvantagePct =
        c.disadvantage > 0 ? Math.round((c.disadvantageDiffSum / c.disadvantage) * 1000) / 10 : null;
      return {
        category: c.category,
        monitored: c.monitored,
        competitive: c.competitive,
        attention: c.attention,
        disadvantage: c.disadvantage,
        competitivePct,
        priority: priorityForCompetitivePct(competitivePct),
        summary: summaryFor(competitivePct),
        avgDisadvantagePct
      };
    })
    .sort((a, b) => a.competitivePct - b.competitivePct);

  return NextResponse.json({ categories });
}
