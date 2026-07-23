"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { IndustryRow, CategoryRow } from "@/lib/types";
import { CategoryAnalysis } from "./CategoryAnalysis";
import { IndustryAnalysis } from "./IndustryAnalysis";
import { EmailComprasModal } from "./EmailComprasModal";

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
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/industries").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json())
    ]).then(([s, i, c]) => {
      setStats(s);
      setIndustries(i.industries || []);
      setCategories(c.categories || []);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-[13px] text-ink-600">Carregando analise...</p>
      </div>
    );
  }

  const pctCompetitive = stats.matchedProducts > 0 ? Math.round((stats.competitive / stats.matchedProducts) * 100) : 0;
  const pctDisadvantage = stats.matchedProducts > 0 ? Math.round((stats.disadvantage / stats.matchedProducts) * 100) : 0;

  const priorityCategories = categories.filter(function (c) { return c.priority !== "Baixa"; }).slice(0, 3);
  const priorityIndustries = industries.filter(function (i) { return i.priority !== "Baixa"; }).slice(0, 3);
  const industriaAtiva = industries[0];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-ink-950 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white">
            <ArrowLeft size={14} />
            Voltar ao painel
          </Link>
          <button
            onClick={function () { setEmailOpen(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-accent-dark"
          >
            <Mail size={13} />
            Gerar e-mail para Compras
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Situacao Geral</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            Concluimos a analise de competitividade dos precos da Martins em comparacao com os principais
            concorrentes. Atualmente estamos competitivos em <strong>{pctCompetitive}%</strong> dos produtos
            monitorados. Entretanto, <strong>{pctDisadvantage}%</strong> dos itens permanecem acima do mercado,
            representando oportunidades importantes para negociacao junto aos fornecedores.
          </p>
        </section>

        {priorityCategories.length > 0 || priorityIndustries.length > 0 ? (
          <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
            <h2 className="text-[16px] font-semibold text-ink-950">Principais oportunidades</h2>
            {priorityCategories.length > 0 ? (
              <div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
                  A analise identificou que as maiores oportunidades concentram-se nas seguintes categorias:
                </p>
                <ul className="mt-1.5 list-disc pl-5 text-[13px] leading-relaxed text-ink-800">
                  {priorityCategories.map(function (c) {
                    return <li key={c.category}>{c.category}</li>;
                  })}
                </ul>
              </div>
            ) : null}
            {priorityIndustries.length > 0 ? (
              <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
                Alem disso, a industria <strong>{priorityIndustries[0].fornecedor}</strong> concentra o maior numero
                de itens em desvantagem.
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Recomendacoes para Compras</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-ink-800">
            <li>Priorizar a negociacao dos itens classificados como Em Desvantagem.</li>
            <li>Concentrar esforcos nas categorias com menor indice de competitividade.</li>
            <li>Revisar fornecedores que concentram maior quantidade de itens acima do mercado.</li>
            <li>Avaliar oportunidades de ampliacao do mix nas categorias em que os concorrentes possuem maior cobertura.</li>
            <li>Acompanhar periodicamente a evolucao da competitividade apos cada negociacao.</li>
          </ul>
        </section>

        <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Visao Geral</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <div className="text-[20px] font-bold text-ink-950">{stats.matchedProducts}</div>
              <div className="text-[12px] text-ink-500">Monitorados</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-good">{stats.competitive}</div>
              <div className="text-[12px] text-ink-500">Competitivos</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-warn">{stats.attention}</div>
              <div className="text-[12px] text-ink-500">Negociacao</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-bad">{stats.disadvantage}</div>
              <div className="text-[12px] text-ink-500">Desvantagem</div>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Analise por Categoria</h2>
          <div className="mt-3">
            <CategoryAnalysis categories={categories} />
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Analise por Industria</h2>
          <div className="mt-3">
            <IndustryAnalysis industries={industries} />
          </div>
        </section>
      </main>

      <EmailComprasModal
        open={emailOpen}
        onClose={function () { setEmailOpen(false); }}
        categories={categories}
        industry={industriaAtiva}
      />
    </div>
  );
}
