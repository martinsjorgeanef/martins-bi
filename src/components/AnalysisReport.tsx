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

function buildEmail(stats: StatsData, categories: CategoryRow[], industries: IndustryRow[]) {
  const pct = stats.matchedProducts > 0 ? Math.round((stats.competitive / stats.matchedProducts) * 100) : 0;
  const priorityCategories = categories.filter((c) => c.priority !== "Baixa").slice(0, 3).map((c) => c.category);
  const priorityIndustries = industries.filter((i) => i.priority !== "Baixa").slice(0, 3).map((i) => i.fornecedor);

  const subject = "Análise de Competitividade – Painel Martins";
  const lines: string[] = [
    "Olá,",
    "",
    "Realizamos a atualização da análise de competitividade dos preços da Martins em comparação com os principais concorrentes.",
    "",
    "Resumo da análise",
    `- Produtos monitorados: ${stats.matchedProducts}`,
    `- Competitivos: ${stats.competitive} (${pct}%)`,
    `- Em negociação: ${stats.attention}`,
    `- Em desvantagem: ${stats.disadvantage}`,
    ""
  ];

  if (priorityCategories.length > 0) {
    lines.push("As principais oportunidades concentram-se nas categorias:");
    priorityCategories.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (priorityIndustries.length > 0) {
    lines.push("As indústrias que mais demandam atenção são:");
    priorityIndustries.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  lines.push(
    "Solicitações para a área de Compras",
    '- Priorizar negociação dos itens classificados como "Em Desvantagem".',
    "- Revisar categorias com menor competitividade.",
    "- Avaliar oportunidades de ampliação do mix.",
    "- Acompanhar a evolução dos indicadores após as negociações.",
    "",
    "Obrigado."
  );

  return { subject, body: lines.join("\n") };
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
        <p className="text-[13px] text-ink-600">Carregando análise...</p>
      </div>
    );
  }

  const pctCompetitive = stats.matchedProducts > 0 ? Math.round((stats.competitive / stats.matchedProducts) * 100) : 0;
  const pctDisadvantage = stats.matchedProducts > 0 ? Math.round((stats.disadvantage / stats.matchedProducts) * 100) : 0;

  const priorityCategories = categories.filter((c) => c.priority !== "Baixa").slice(0, 3);
  const priorityIndustries = industries.filter((i) => i.priority !== "Baixa").slice(0, 3);

  const email = buildEmail(stats, categories, industries);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-ink-950 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white">
            <ArrowLeft size={14} />
            Voltar ao painel
          </Link>
          <button
            onClick={() => setEmailOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-accent-dark"
          >
            <Mail size={13} />
            Gerar e-mail para Compras
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Situação Geral</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            Concluímos a análise de competitividade dos preços da Martins em comparação com os principais
            concorrentes. Atualmente estamos competitivos em <strong>{pctCompetitive}%</strong> dos produtos
            monitorados. Entretanto, <strong>{pctDisadvantage}%</strong> dos itens permanecem acima do mercado,
            representando oportunidades importantes para negociação junto aos fornecedores.
          </p>
        </section>

        {(priorityCategories.length > 0 || priorityIndustries.length > 0) && (
          <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
            <h2 className="text-[16px] font-semibold text-ink-950">Principais oportunidades</h2>
            {priorityCategories.length > 0 && (
              <>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
                  A análise identificou que as maiores oportunidades concentram-se nas seguintes categorias:
                </p>
                <ul className="mt-1.5 list-disc pl-5 text-[13px] leading-relaxed text-ink-800">
                  {priorityCategories.map((c) => (
                    <li key={c.category}>{c.category}</li>
                  ))}
                </ul>
              </>
            )}
            {priorityIndustries.length > 0 && (
              <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
                Além disso, a indústria <strong>{priorityIndustries[0].fornecedor}</strong> concentra o maior número
                de itens em desvantagem.
              </p>
            )}
          </section>
        )}

        <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Recomendações para Compras</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-ink-800">
            <li>Priorizar a negociação dos itens classificados como &quot;Em Desvantagem&quot;.</li>
            <li>Concentrar esforços nas categorias com menor índice de competitividade.</li>
            <li>Revisar fornecedores que concentram maior quantidade de itens acima do mercado.</li>
            <li>
              Avaliar oportunidades de ampliação do mix nas categorias em que os concorrentes possuem maior
              cobertura.
            </li>
            <li>Acompanhar periodicamente a evolução da competitividade após cada negociação.</li>
          </ul>
        </section>

        <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Visão Geral</h2>
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
              <div className="text-[12px] text-ink-500">Negociação</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-bad">{stats.disadvantage}</div>
              <div className="text-[12px] text-ink-500">Desvantagem</div>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Análise por Categoria</h2>
          <div className="mt-3">
            <CategoryAnalysis categories={categories} />
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink-950">Análise por Indústria</h2>
          <div className="mt-3">
            <IndustryAnalysis industries={industries} />
          </div>
        </section>
      </main>

      <EmailComprasModal open={emailOpen} onClose={() => setEmailOpen(false)} subject={email.subject} body={email.body} />
    </div>
  );
}
