import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const count = await prisma.cadgerItem.count();
  const lastLog = await prisma.uploadLog.findFirst({
    where: { type: "CADGER" },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    count: count,
    lastUpdatedAt: lastLog ? lastLog.createdAt.toISOString() : null
  });
}
