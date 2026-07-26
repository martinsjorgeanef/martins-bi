"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Senha incorreta.");
        return;
      }
      const next = searchParams.get("next") || "/";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Lock size={18} className="text-white" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-ink-950">Competitividade Martins</div>
            <div className="text-[12px] text-ink-500">Acesso restrito</div>
          </div>
        </div>

        <label className="mt-5 block text-[12px] font-medium text-ink-600">Senha de acesso</label>
        <Input
          type="password"
          value={password}
          onChange={function (e) { setPassword(e.target.value); }}
          placeholder="Digite a senha"
          className="mt-1 w-full"
          autoFocus
        />

        {error ? <p className="mt-2 text-[13px] text-bad">{error}</p> : null}

        <Button type="submit" variant="primary" disabled={loading || !password} className="mt-4 w-full">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
