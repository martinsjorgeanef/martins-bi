"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { DisadvantageItem } from "./Charts";
import { SalesMessageModal } from "./SalesMessageModal";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const CATEGORY_EMOJI: Record<string, string> = {
  "HIGIENE BUCAL": "🦷",
  SABONETE: "🧴",
  "CUIDADO COM O CABELO": "🧼"
};

export function VendasReport() {
  const [items, setItems] = useState<DisadvantageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);

  useEffect(function () {
    fetch("/api/stats")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setItems(data.topAdvantage || []);
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

  const byCategory = new Map<string, DisadvantageItem[]>();
  items.forEach(function (it) {
    const cat = it.category ? it.category : "Sem categoria";
    const list = byCategory.get(cat) || [];
    list.push(it);
    byCategory.set(cat, list);
  });

  const categoryNames = Array.from(byCategory.keys()).sort(function (a, b) {
    return (byCategory.get(b) || []).length - (byCategory.get(a) || []).length;
  });

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
        <h1 className="mb-1 text-[14px] font-semibold text-[#1F2937]">Para Vendas</h1>
        <p className="mb-4 text-[10px] text-[#94A3B8]">Categorias e produtos com maior oportunidade comercial</p>

        {categoryNames.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-card">
            <p className="text-[11px] text-ink-600">Nenhuma oportunidade identificada no momento.</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 rounded-xl bg-white p-4 shadow-card">
              <h3 className="text-[11px] font-semibold text-[#1F2937]">Resumo por Categoria</h3>
              <div className="mt-2 flex flex-col gap-1">
                {categoryNames.map(function (cat) {
                  const count = (byCategory.get(cat) || []).length;
                  return (
                    <div key={cat} className="flex items-center justify-between text-[10px]">
                      <span className="font-medium text-[#1F2937]">{cat}</span>
                      <span className="text-[#6B7280]">
                        {count} produto{count !== 1 ? "s" : ""} com vantagem competitiva
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {categoryNames.map(function (cat) {
                const catItems = byCategory.get(cat) || [];
                const emoji = CATEGORY_EMOJI[cat.toUpperCase()] || "🛍️";
                return (
                  <div key={cat} className="rounded-xl bg-white p-4 shadow-card">
                    <h3 className="text-[12px] font-semibold text-[#1F2937]">
                      {emoji} {cat.toUpperCase()}
                    </h3>
                    <table className="mt-2 w-full border-collapse">
                      <thead>
                        <tr className="text-left text-[9px] uppercase tracking-wide text-[#94A3B8]">
                          <th className="pb-1.5 pr-2 font-medium">Produto</th>
                          <th className="pb-1.5 text-right font-medium">Preco Martins</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catItems.map(function (it) {
                          return (
                            <tr key={it.ean} className="border-t border-line/50">
                              <td className="py-1.5 pr-2 text-[10px] text-[#1F2937]">{it.description}</td>
                              <td className="py-1.5 text-right text-[10px] font-semibold tabular-nums text-[#16A34A]">
                                {it.martinsPrice !== undefined ? money(it.martinsPrice) : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <SalesMessageModal open={messageOpen} onClose={function () { setMessageOpen(false); }} items={items} />
    </div>
  );
}
