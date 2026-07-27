import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/authToken";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
