import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    thresholdPct: settings ? settings.thresholdPct : 5,
    activeCompetitors: settings ? settings.activeCompetitors : ""
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await prisma.settings.findUnique({ where: { id: "singleton" } });

  const thresholdPct = body.thresholdPct !== undefined ? body.thresholdPct : existing ? existing.thresholdPct : 5;
  const activeCompetitors =
    body.activeCompetitors !== undefined ? body.activeCompetitors : existing ? existing.activeCompetitors : "";

  const updated = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", thresholdPct: thresholdPct, activeCompetitors: activeCompetitors },
    update: { thresholdPct: thresholdPct, activeCompetitors: activeCompetitors }
  });

  return NextResponse.json({ thresholdPct: updated.thresholdPct, activeCompetitors: updated.activeCompetitors });
}
