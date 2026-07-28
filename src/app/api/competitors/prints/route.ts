import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const fornecedor = req.nextUrl.searchParams.get("fornecedor");

  if (!fornecedor) {
    return NextResponse.json({ error: "Informe o fornecedor." }, { status: 400 });
  }

  const prints = await prisma.competitorPrint.findMany({
    where: { fornecedor: fornecedor },
    select: { competitorName: true, imageData: true, mimeType: true }
  });

  const result = prints.map(function (p) {
    return {
      competitorName: p.competitorName,
      mimeType: p.mimeType,
      imageBase64: Buffer.from(p.imageData).toString("base64")
    };
  });

  return NextResponse.json({ prints: result });
}
