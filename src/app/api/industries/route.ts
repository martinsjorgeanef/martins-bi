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
  type ConcAgg = { cadastrados: number; comPreco: number };
  const concByFornecedor = new Map();
  for (const c of catalogItems) {
    const entry: ConcAgg = concByFornecedor.get(c.fornecedor) ?? { cadastrados: 0, comPreco: 0 };
    entry.cadastrados++;
    if (c.price !== null) entry.comPreco++;
    concByFornecedor.set(c.fornecedor, entry);
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
      const conc: ConcAgg = concByFornecedor.get(fornecedor) ?? { cadastrados: 0, comPreco: 0 };
      return {
        fornecedor,
        cadastrados: data.cadastrados,
        itensMartins: data.itensMartins,
        itensConcorrenteCadastrados: conc.cadastrados,
        itensConcorrenteComPreco: conc.comPreco,
        diferenca: conc.cadastrados - data.itensMartins,
        ruptura: data.cadastrados - data.itensMartins
      };
    })
    .sort((a, b) => b.cadastrados - a.cadastrados);

  return NextResponse.json({ industries, hasCadger: true });
}
