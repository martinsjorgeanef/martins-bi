import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/authToken";

// Protege TUDO por padrao (paginas e APIs, incluindo as destrutivas como
// /api/clear e /api/upload) e so libera explicitamente a pagina de login
// e as rotas de autenticacao. Ver README/.env.example para configurar
// APP_PASSWORD antes do deploy - sem essa variavel, ninguem consegue entrar.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)"]
};

export async function middleware(req: NextRequest) {
  var token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  var valid = await verifySessionToken(token);

  if (valid) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  var loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
