import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcDiffPct, calcStatus, calcRequiredDiscountPct } from "@/lib/calculations";
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
  thresholdFraction: number,
  selectedCompetitors: string[] | null,
  distributorFilter: string
): ProductRow {
  var allCompetitors = product.competitorPrices.map(function (c) {
    return { name: c.competitorName, price: c.price };
  });

  if (distributorFilter) {
    var exact = allCompetitors.find(function (c) { return c.name === distributorFilter; });

    if (!exact) {
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
        competitors: allCompetitors,
        martinsUpdatedAt: product.martinsUpdatedAt.toISOString()
      };
    }

    const diffPctExact = calcDiffPct(product.martinsPrice, exact.price);
    const statusExact = calcStatus(diffPctExact, thresholdFraction);

    const rowExact: ProductRow = {
      id: product.id,
      ean: product.ean,
      description: product.description,
      category: product.category,
      supplier: product.supplier,
      martinsPrice: product.martinsPrice,
      marketPrice: exact.price,
      bestCompetitor: exact.name,
      diffPct: diffPctExact,
      status: statusExact,
      competitors: allCompetitors,
      martinsUpdatedAt: product.martinsUpdatedAt.toISOString()
    };

    if (statusExact === "DESVANTAGEM") {
      rowExact.requiredDiscountPct = calcRequiredDiscountPct(product.martinsPrice, exact.price, thresholdFraction);
    }

    return rowExact;
  }

  var consideredCompetitors = selectedCompetitors
    ? allCompetitors.filter(function (c) { return selectedCompetitors.indexOf(c.name) !== -1; })
    : allCompetitors;

  if (consideredCompetitors.length === 0) {
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
      competitors: allCompetitors,
      martinsUpdatedAt: product.martinsUpdatedAt.toISOString()
    };
  }

  const best = consideredCompetitors.reduce(function (min, c) {
    return c.price < min.price ? c : min;
  });
  const diffPct = calcDiffPct(product.martinsPrice, best.price);
  const status = calcStatus(diffPct, thresholdFraction);

  const row: ProductRow = {
    id: product.id,
    ean: product.ean,
    description: product.description,
    category: product.category,
    supplier: product.supplier,
    martinsPrice: product.martinsPrice,
    marketPrice: best.price,
    bestCompetitor: best.name,
    diffPct: diffPct,
    status: status,
    competitors: allCompetitors,
    martinsUpdatedAt: product.martinsUpdatedAt.toISOString()
  };

  if (status === "DESVANTAGEM") {
    row.requiredDiscountPct = calcRequiredDiscountPct(product.martinsPrice, best.price, thresholdFraction);
  }

  return row;
}

function buildMissingRows(
  catalogItems: { ean: string; fornecedor: string; competitorName: string; price: number | null; description: string | null; updatedAt: Date }[],
  selectedCompetitors: string[] | null,
  distributorFilter: string
): ProductRow[] {
  var filtered = selectedCompetitors
    ? catalogItems.filter(function (c) { return selectedCompetitors.indexOf(c.competitorName) !== -1; })
    : catalogItems;

  if (distributorFilter) {
    filtered = filtered.filter(function (c) { return c.competitorName === distributorFilter; });
  }

  var byEan = new Map<string, typeof filtered>();
  filtered.forEach(function (item) {
    var arr = byEan.get(item.ean) || [];
    arr.push(item);
    byEan.set(item.ean, arr);
  });

  var rows: ProductRow[] = [];
  byEan.forEach(function (items, ean) {
    var withPrice = items.filter(function (i) { return i.price !== null; });
    var best = withPrice.length > 0
      ? withPrice.reduce(function (min, c) { return c.price! < min.price! ? c : min; })
      : items[0];

    var competitors = withPrice.map(function (i) {
      return { name: i.competitorName, price: i.price as number };
    });

    rows.push({
      id: "missing-" + ean,
      ean: ean,
      description: best.description || "(descricao nao disponivel - reimporte a planilha do concorrente)",
      category: null,
      supplier: best.fornecedor,
      martinsPrice: 0,
      marketPrice: best.price,
      bestCompetitor: best.competitorName,
      diffPct: null,
      status: "NAO_CADASTRADO_MARTINS",
      competitors: competitors,
      martinsUpdatedAt: best.updatedAt.toISOString()
    });
  });

  return rows;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const competitorsParam = searchParams.get("competitors") || "";
  const supplier = searchParams.get("supplier") || "";
  const distributor = searchParams.get("distributor") || "";
  const sortBy = searchParams.get("sortBy") || "diffPct";
  const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(5000, Math.max(10, Number(searchParams.get("pageSize") || 50)));

  const selectedCompetitors = competitorsParam
    ? competitorsParam.split(",").map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; })
    : null;

  const thresholdFraction = await getThreshold();

  const products = await prisma.product.findMany({
    include: { competitorPrices: true },
    orderBy: { description: "asc" }
  });

  let rows = products.map(function (p) {
    return buildRow(p, thresholdFraction, selectedCompetitors, distributor);
  });

  const productEans = new Set(products.map(function (p) { return p.ean; }));
  const catalogItems = await prisma.competitorCatalogItem.findMany({
    where: { ean: { notIn: Array.from(productEans) } }
  });
  const missingRows = buildMissingRows(catalogItems, selectedCompetitors, distributor);
  rows = rows.concat(missingRows);

  if (status !== "SEM_DADOS" && status !== "NAO_CADASTRADO_MARTINS") {
    rows = rows.filter(function (r) { return r.status !== "SEM_DADOS" && r.status !== "NAO_CADASTRADO_MARTINS"; });
  }

  if (search) {
    rows = rows.filter(function (r) {
      return r.ean.includes(search) || r.description.toLowerCase().includes(search);
    });
  }
  if (category) {
    rows = rows.filter(function (r) { return r.category === category; });
  }
  if (status) {
    rows = rows.filter(function (r) { return r.status === status; });
  }
  if (supplier) {
    rows = rows.filter(function (r) { return r.supplier === supplier; });
  }

  rows.sort(function (a, b) {
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
    total: total,
    page: page,
    pageSize: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  });
}
