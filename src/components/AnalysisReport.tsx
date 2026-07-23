"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { IndustryRow } from "@/lib/types";

interface StatsData {
  totalProducts: number;
  matchedProducts: number;
  competitive: number;
  attention: number;
  disadvantage: number;
  thresholdPct: number;
}

export function AnalysisReport() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/industries").then((r) => r.json())
    ]).then(([s, i]) => {
      setStats(s);
      setIndustries(i.industries || []);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-ink-600">Carregando análise...</p>
      </div>
    );
  }

  const pctCompetitive = stats.matchedProducts > 0 ? (stats.competitive / stats.matchedProducts) * 100 : 0;
  const pctDisadvantage = stats.matchedProducts > 0 ? (stats.disadvantage / stats.matchedProducts) * 100 : 0;

  const industriaAtiva = industries[0];
  const temRuptura = industriaAtiva && industriaAtiva.ruptura > 0;
  const concorrenteNaFrente = industriaAtiva && industriaAtiva.diferenca > 0;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-ink-950 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
            <ArrowLeft size={14} />
            Voltar ao painel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-accent" />
          <h1 className="font-display text-base font-semibold text-ink-950">
            Análise de competitividade e apoio a Compras
          </h1>
        </div>

        <section className="mb-4 rounded-lg border border-line bg-white p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600">Como estamos frente ao mercado</h2>
          <p className="text-[13px] leading-relaxed text-ink-800">
            De {stats.matchedProducts.toLocaleString("pt-BR")} produtos com dados de mercado (de um total de{" "}
            {stats.totalProducts.toLocaleString("pt-BR")} monitorados), a Martins está{" "}
            <strong>competitiva em {pctCompetitive.toFixed(0)}%</strong> dos itens comparados e em{" "}
            <strong>desvantagem em {pctDisadvantage.toFixed(0)}%</strong> — ou seja, {stats.disadvantage}{" "}
            produto{stats.disadvantage !== 1 ? "s têm" : " tem"} preço mais caro que o mercado, considerando o
            limite de negociação de {stats.thresholdPct}%.
          </p>
        </section>

        {industriaAtiva && (
          <section className="mb-4 rounded-lg border border-line bg-white p-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
              Indústria em análise: {industriaAtiva.fornecedor}
            </h2>
            <p className="text-[13px] leading-relaxed text-ink-800">
              A Martins tem <strong>{industriaAtiva.itensMartins} itens</strong> ativos dessa indústria, contra{" "}
              <strong>{industriaAtiva.itensConcorrenteCadastrados} itens</strong> cadastrados pelo concorrente
              importado.{" "}
              {concorrenteNaFrente
                ? `O concorrente tem ${industriaAtiva.diferenca} itens a mais cadastrados do que a Martins — uma oportunidade de ampliar o mix.`
                : industriaAtiva.diferenca < 0
                ? `A Martins tem ${Math.abs(industriaAtiva.diferenca)} itens a mais cadastrados do que o concorrente.`
                : "Ambos têm a mesma quantidade de itens cadastrados."}
              {temRuptura &&
                ` Além disso, ${industriaAtiva.ruptura} itens estão cadastrados no CADGER mas sem preço ativo na Martins (possível ruptura).`}
            </p>
          </section>
        )}

        <section className="rounded-lg border border-accent/30 bg-accent/5 p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-dark">
            Solicitação de apoio à área de Compras
          </h2>
          <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink-800">
            <li>
              Negociar redução de preço nos <strong>{stats.disadvantage} itens em desvantagem</strong>, priorizando
              os de maior diferença percentual (ver gráfico "Maiores desvantagens de preço" no painel).
            </li>
            {industriaAtiva && temRuptura && (
              <li>
                Avaliar o cadastro/reativação dos <strong>{industriaAtiva.ruptura} itens em ruptura</strong> da
                indústria {industriaAtiva.fornecedor}.
              </li>
            )}
            {industriaAtiva && concorrenteNaFrente && (
              <li>
                Avaliar a inclusão dos itens que o concorrente tem cadastrado e a Martins ainda não trabalha, na
                indústria {industriaAtiva.fornecedor}.
              </li>
            )}
            <li>Revisar periodicamente os itens em "negociação pontual", antes que virem desvantagem.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
