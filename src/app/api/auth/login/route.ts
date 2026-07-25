import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/authToken";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = typeof body.password === "string" ? body.password : "";
    const expected = process.env.APP_PASSWORD || "";

    if (!expected) {
      return NextResponse.json(
        { error: "APP_PASSWORD nao esta configurada no servidor. Contate quem administra o sistema." },
        { status: 500 }
      );
    }

    if (!password || password !== expected) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    const token = await createSessionToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao processar o login." }, { status: 500 });
  }
}
