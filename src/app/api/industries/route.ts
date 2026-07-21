import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const catalogItems = await prisma.competitorCatalogItem.findMany();

  if (catalogItems.length === 0) {
    return NextResponse.json({ industries: [], hasCadger: false });
  }

  const fornecedoresImportados = Array.from(new Set(catalogItems.map((c) => c.fornecedor)));

  const cadgerItems = await prisma.cadgerItem.findMany({
    where: { fornecedor: { in: fornecedoresImportados } }
  });
  const eans = cadgerItems.map((c) => c.ean);
  const products = await prisma.product.findMany({ where: { ean: { in: eans } } });
  const productByEan = new Map(products.map((p) => [p.ean, p]));

  type ConcAgg = { cadastrados: number; comPreco: number };
  const concByFornecedor = new Map<string, ConcAgg>();
  for (const c of catalogItems) {
    const entry = concByFornecedor.get(c.fornecedor) ?? { cadastrados: 0, comPreco: 0 };
    entry.cadastrados++;
    if (c.price !== null) entry.comPreco++;
    concByFornecedor.set(c.fornecedor, entry);
  }

  type FornecedorAgg = { cadastrados: number; itensMartins: number };
  const byFornecedor = new Map<string, FornecedorAgg>();
  for (const item of cadgerItems) {
    const entry = byFornecedor.get(item.fornecedor) ?? { cadastrados: 0, itensMartins: 0 };
    entry.cadastrados++;
    if (productByEan.has(item.ean)) entry.itensMartins++;
    byFornecedor.set(item.fornecedor, entry);
  }

  const industries = fornecedoresImportados
    .map((fornecedor) => {
      const cadger = byFornecedor.get(fornecedor) ?? { cadastrados: 0, itensMartins: 0 };
      const conc = concByFornecedor.get(fornecedor)!;
      return {
        fornecedor,
        cadastrados: cadger.cadastrados,
        itensMartins: cadger.itensMartins,
        itensConcorrenteCadastrados: conc.cadastrados,
        itensConcorrenteComPreco: conc.comPreco,
        diferenca: conc.cadastrados - cadger.itensMartins,
        ruptura: cadger.cadastrados - cadger.itensMartins
      };
    })
    .sort((a, b) => b.itensConcorrenteCadastrados - a.itensConcorrenteCadastrados);

  return NextResponse.json({ industries, hasCadger: true });
}
