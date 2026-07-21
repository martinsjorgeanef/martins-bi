import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", thresholdPct: 5 },
    update: {}
  });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const thresholdPct = Number(body.thresholdPct);

  if (!Number.isFinite(thresholdPct) || thresholdPct < 0 || thresholdPct > 100) {
    return NextResponse.json({ error: "Limite inválido. Use um valor entre 0 e 100." }, { status: 400 });
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", thresholdPct },
    update: { thresholdPct }
  });

  return NextResponse.json(settings);
}
