import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cadgerItems = await prisma.cadgerItem.findMany();

  if (cadgerItems.length === 0) {
    return NextResponse.json({ industries: [], hasCadger: false });
  }

  const eans = cadgerItems.map((c) => c.ean);

  const products = await prisma.product.findMany({
    where: { ean: { in: eans } },
    include: { competitorPrices: true }
  });

  const productByEan = new Map(products.map((p) => [p.ean, p]));

  type FornecedorAgg = { cadastrados: number; comPrecoAtivo: number; concorrenteCadastrado: number };
  const byFornecedor = new Map();

  for (const item of cadgerItems) {
    const entry: FornecedorAgg = byFornecedor.get(item.fornecedor) ?? {
      cadastrados: 0,
      comPrecoAtivo: 0,
      concorrenteCadastrado: 0
    };
    entry.cadastrados++;

    const product = productByEan.get(item.ean);
    if (product) {
      entry.comPrecoAtivo++;
      if (product.competitorPrices.length > 0) {
        entry.concorrenteCadastrado++;
      }
    }

    byFornecedor.set(item.fornecedor, entry);
  }

  const industries = Array.from(byFornecedor.entries())
    .map(([fornecedor, data]: [string, FornecedorAgg]) => ({
      fornecedor,
      cadastrados: data.cadastrados,
      comPrecoAtivo: data.comPrecoAtivo,
      ruptura: data.cadastrados - data.comPrecoAtivo,
      rupturaPct:
        data.cadastrados > 0 ? ((data.cadastrados - data.comPrecoAtivo) / data.cadastrados) * 100 : 0,
      concorrenteCadastrado: data.concorrenteCadastrado
    }))
    .sort((a, b) => b.cadastrados - a.cadastrados);

  return NextResponse.json({ industries, hasCadger: true });
}
