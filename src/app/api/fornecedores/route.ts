import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.cadgerItem.findMany({
    select: { fornecedor: true },
    distinct: ["fornecedor"]
  });
  const fornecedores = Array.from(new Set(items.map((i) => i.fornecedor))).sort();
  return NextResponse.json({ fornecedores });
}
