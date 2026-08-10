import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const fornecedor = req.nextUrl.searchParams.get("fornecedor");

  if (!fornecedor) {
    return NextResponse.json({ error: "Informe o fornecedor." }, { status: 400 });
  }

  const catalogItems = await prisma.competitorCatalogItem.findMany({
    where: { fornecedor: fornecedor }
  });

  const eans = catalogItems.map(function (c) { return c.ean; });

  const existingProducts = await prisma.product.findMany({
    where: { ean: { in: eans } },
    select: { ean: true }
  });
  const existingEans = new Set(existingProducts.map(function (p) { return p.ean; }));

  const missing = catalogItems
    .filter(function (c) { return !existingEans.has(c.ean); })
    .map(function (c) {
      return {
        ean: c.ean,
        description: c.description || "(descricao nao disponivel - reimporte a planilha do concorrente)",
        price: c.price,
        competitorName: c.competitorName
      };
    })
    .sort(function (a, b) { return a.description.localeCompare(b.description); });

  return NextResponse.json({ missing: missing, total: missing.length });
}
