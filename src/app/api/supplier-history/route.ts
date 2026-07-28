import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const fornecedor = searchParams.get("fornecedor");
    const estado = searchParams.get("estado");

    if (!fornecedor || !estado) {
      return NextResponse.json({ error: "Informe fornecedor e estado." }, { status: 400 });
    }

    const rows = await prisma.supplierHistory.findMany({
      where: { fornecedor: fornecedor, estado: estado },
      orderBy: { mes: "desc" }
    });

    return NextResponse.json({ rows: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar historico." }, { status: 500 });
  }
}
