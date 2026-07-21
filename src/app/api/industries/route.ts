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
  const products = await prisma.product.findMany({ where: { ean: { in: eans } } });
  const productByEan = new Map(products.map((p) => [p.ean, p]));

  const catalogItems = await prisma.competitorCatalogItem.findMany();
  const concorrenteCountByFornecedor = new Map<string, number>();
  for (const c of catalogItems) {
    concorrenteCountByFornecedor.set(c.fornecedor, (concorrenteCountByFornecedor.get(c.fornecedor) ?? 0) + 1);
  }

  type FornecedorAgg = { cadastrados: number; itensMartins: number };
  const byFornecedor = new Map();

  for (const item of cadgerItems) {
    const entry: FornecedorAgg = byFornecedor.get(item.fornecedor) ?? { cadastrados: 0, itensMartins: 0 };
    entry.cadastrados++;
    if (productByEan.has(item.ean)) entry.itensMartins++;
    byFornecedor.set(item.fornecedor, entry);
  }

  const industries = Array.from(byFornecedor.entries())
    .map(([fornecedor, data]: [string, FornecedorAgg]) => {
      const itensConcorrente = concorrenteCountByFornecedor.get(fornecedor) ?? 0;
      return {
        fornecedor,
        cadastrados: data.cadastrados,
        itensMartins: data.itensMartins,
        itensConcorrente,
        diferenca: itensConcorrente - data.itensMartins,
        ruptura: data.cadastrados - data.itensMartins
      };
    })
    .sort((a, b) => b.cadastrados - a.cadastrados);

  return NextResponse.json({ industries, hasCadger: true });
}
