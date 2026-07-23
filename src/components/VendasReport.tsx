"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { TopAdvantageChart, DisadvantageItem } from "./Charts";
import { CategoryRow } from "@/lib/types";
import { SalesMessageModal } from "./SalesMessageModal";

export function VendasReport() {
  const [topAdvantage, setTopAdvantage] = useState<DisadvantageItem[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);

  useEffect(function () {
    Promise.all([
      fetch("/api/stats").then(function (r) { return r.json(); }),
      fetch("/api/categories").then(function (r) { return r.json(); })
    ]).then(function (results) {
      const stats = results[0];
      const cats = results[1];
      setTopAdvantage(stats.topAdvantage || []);
      setCategories(cats.categories || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-[13px] text-ink-600">Carregando...</p>
      </div>
    );
  }

  const healthyCategories = categories
    .filter(function (c) { return c.priority === "Baixa"; })
    .sort(function (a, b) { return b.competitivePct - a.competitivePct; })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-ink-950 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-[12px] text-white/70 hover:text-white">
            <ArrowLeft size={14} />
            Voltar ao painel
          </Link>
          <button
            onClick={function () { setMessageOpen(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-good px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90"
          >
            <MessageCircle size={13} />
            Gerar mensagem para Vendas
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-3 text-[14px] font-semibold text-[#1F2937]">Para Vendas</h1>

        <div className="mb-4">
          <TopAdvantageChart data={topAdvantage} />
        </div>

        {healthyCategories.length > 0 ? (
          <div className="rounded-xl bg-white p-4 shadow-card">
            <h3 className="text-[12px] font-semibold text-[#1F2937]">Categorias com melhor posicionamento</h3>
            <p className="mt-0.5 text-[8px] text-[#94A3B8]">Argumentos para reforcar a venda</p>
            <div className="mt-2 flex flex-col gap-2">
              {healthyCategories.map(function (c) {
                return (
                  <div key={c.category} className="flex items-center justify-between rounded-md bg-surface px-3 py-2">
                    <span className="text-[11px] font-medium text-[#1F2937]">{c.category}</span>
                    <span className="text-[12px] font-bold text-good">{c.competitivePct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </main>

      <SalesMessageModal open={messageOpen} onClose={function () { setMessageOpen(false); }} items={topAdvantage} />
    </div>
  );
}
