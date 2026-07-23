import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcDiffPct, calcStatus, priorityForCompetitivePct } from "@/lib/calculations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const thresholdFraction = (settings?.thresholdPct ?? 5) / 100;

  const catalogItems = await prisma.competitorCatalogItem.findMany();

  if (catalogItems.length === 0) {
    return NextResponse.json({ industries: [], hasCadger: false });
  }

  // Só considera as indústrias que realmente têm planilha de concorrente importada agora
  const fornecedoresImportados = Array.from(new Set(catalogItems.map((c) => c.fornecedor)));

  const cadgerItems = await prisma.cadgerItem.findMany({
    where: { fornecedor: { in: fornecedoresImportados } }
  });
  const eans = cadgerItems.map((c) => c.ean);
  const products = await prisma.product.findMany({
    where: { ean: { in: eans } },
    include: { competitorPrices: true }
  });
  const productByEan = new Map(products.map((p) => [p.ean, p]));

  type ConcAgg = { cadastrados: number; comPreco: number };
  const concByFornecedor = new Map<string, ConcAgg>();
  for (const c of catalogItems) {
    const entry = concByFornecedor.get(c.fornecedor) ?? { cadastrados: 0, comPreco: 0 };
    entry.cadastrados++;
    if (c.price !== null) entry.comPreco++;
    concByFornecedor.set(c.fornecedor, entry);
  }

  type FornecedorAgg = {
    cadastrados: number;
    itensMartins: number;
    competitive: number;
    attention: number;
    disadvantage: number;
    matched: number;
  };
  const byFornecedor = new Map<string, FornecedorAgg>();

  for (const item of cadgerItems) {
    const entry = byFornecedor.get(item.fornecedor) ?? {
      cadastrados: 0,
      itensMartins: 0,
      competitive: 0,
      attention: 0,
      disadvantage: 0,
      matched: 0
    };
    entry.cadastrados++;

    const product = productByEan.get(item.ean);
    if (product) {
      entry.itensMartins++;
      if (product.competitorPrices.length > 0) {
        entry.matched++;
        const best = product.competitorPrices.reduce((min, c) => (c.price < min.price ? c : min));
        const diffPct = calcDiffPct(product.martinsPrice, best.price);
        const status = calcStatus(diffPct, thresholdFraction);
        if (status === "COMPETITIVO") entry.competitive++;
        else if (status === "ATENCAO") entry.attention++;
        else entry.disadvantage++;
      }
    }

    byFornecedor.set(item.fornecedor, entry);
  }

  const industries = fornecedoresImportados
    .map((fornecedor) => {
      const data = byFornecedor.get(fornecedor) ?? {
        cadastrados: 0,
        itensMartins: 0,
        competitive: 0,
        attention: 0,
        disadvantage: 0,
        matched: 0
      };
      const conc = concByFornecedor.get(fornecedor)!;
      const competitivePct = data.matched > 0 ? Math.round((data.competitive / data.matched) * 1000) / 10 : 0;
      const diferenca = conc.cadastrados - data.itensMartins;
      const ruptura = data.cadastrados - data.itensMartins;

      let summary: string;
      if (data.matched === 0) {
        summary = "Ainda não há comparação de preço suficiente para esta indústria.";
      } else if (competitivePct >= 85) {
        summary = "Indústria com boa competitividade, sem necessidade de ação imediata.";
      } else if (competitivePct >= 70) {
        summary = "Competitividade intermediária. Vale acompanhar os itens em desvantagem.";
      } else {
        summary = "Competitividade abaixo do esperado. Priorizar negociação nesta indústria.";
      }

      return {
        fornecedor,
        cadastrados: data.cadastrados,
        itensMartins: data.itensMartins,
        itensConcorrenteCadastrados: conc.cadastrados,
        itensConcorrenteComPreco: conc.comPreco,
        diferenca,
        ruptura,
        competitivePct,
        disadvantage: data.disadvantage,
        priority: priorityForCompetitivePct(competitivePct),
        summary
      };
    })
    .sort((a, b) => b.itensConcorrenteCadastrados - a.itensConcorrenteCadastrados);

  return NextResponse.json({ industries, hasCadger: true });
}
