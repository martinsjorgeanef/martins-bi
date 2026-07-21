import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcDiffPct, calcStatus } from "@/lib/calculations";
import { ProductRow } from "@/lib/types";

export const runtime = "nodejs";

async function getThreshold(): Promise<number> {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  return (settings?.thresholdPct ?? 5) / 100;
}

function buildRow(
  product: {
    id: string;
    ean: string;
    description: string;
    category: string | null;
    supplier: string | null;
    martinsPrice: number;
    martinsUpdatedAt: Date;
    competitorPrices: { competitorName: string; price: number }[];
  },
  thresholdFraction: number
): ProductRow {
  const competitors = product.competitorPrices.map((c) => ({
    name: c.competitorName,
    price: c.price
  }));

  if (competitors.length === 0) {
    return {
      id: product.id,
      ean: product.ean,
      description: product.description,
      category: product.category,
      supplier: product.supplier,
      martinsPrice: product.martinsPrice,
      marketPrice: null,
      bestCompetitor: null,
      diffPct: null,
      status: "SEM_DADOS",
      competitors,
      martinsUpdatedAt: product.martinsUpdatedAt.toISOString()
    };
  }

  const best = competitors.reduce((min, c) => (c.price < min.price ? c : min));
  const diffPct = calcDiffPct(product.martinsPrice, best.price);
  const status = calcStatus(diffPct, thresholdFraction);

  return {
    id: product.id,
    ean: product.ean,
    description: product.description,
    category: product.category,
    supplier: product.supplier,
    martinsPrice: product.martinsPrice,
    marketPrice: best.price,
    bestCompetitor: best.name,
    diffPct,
    status,
    competitors,
    martinsUpdatedAt: product.martinsUpdatedAt.toISOString()
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const competitor = searchParams.get("competitor") || "";
  const sortBy = searchParams.get("sortBy") || "diffPct";
  const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(500, Math.max(10, Number(searchParams.get("pageSize") || 50)));

  const thresholdFraction = await getThreshold();

  const products = await prisma.product.findMany({
    include: { competitorPrices: true },
    orderBy: { description: "asc" }
  });

  let rows = products.map((p) => buildRow(p, thresholdFraction));

  if (search) {
    rows = rows.filter(
      (r) => r.ean.includes(search) || r.description.toLowerCase().includes(search)
    );
  }
  if (category) {
    rows = rows.filter((r) => r.category === category);
  }
  if (status) {
    rows = rows.filter((r) => r.status === status);
  }
  if (competitor) {
    rows = rows.filter((r) => r.competitors.some((c) => c.name === competitor));
  }

  rows.sort((a, b) => {
    const valA = a[sortBy as keyof ProductRow];
    const valB = b[sortBy as keyof ProductRow];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * sortDir;
    }
    return String(valA).localeCompare(String(valB)) * sortDir;
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const paginated = rows.slice(start, start + pageSize);

  return NextResponse.json({
    rows: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  });
}
