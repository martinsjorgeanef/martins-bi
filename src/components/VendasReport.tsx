"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { DisadvantageItem } from "./Charts";
import { SalesMessageModal } from "./SalesMessageModal";
import { cleanProductName } from "@/lib/productNameCleaner";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

var CATEGORY_EMOJI: Record<string, string> = {
  "HIGIENE BUCAL": "🦷",
  SABONETE: "🧼",
  SABONETES: "🧼",
  "CUIDADO COM O CABELO": "🧴",
  "HIGIENE INFANTIL": "👶"
};

function emojiFor(category: string): string {
  var key = category.toUpperCase();
  return CATEGORY_EMOJI[key] || "🛍️";
}

interface VariantLine {
  weight: string | null;
  price: number | undefined;
}

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

  var byCategory = new Map<string, Map<string, VariantLine[]>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description);

    if (!byCategory.has(category)) byCategory.set(category, new Map());
    var itemMap = byCategory.get(category) as Map<string, VariantLine[]>;

    if (!itemMap.has(cleaned.itemName)) itemMap.set(cleaned.itemName, []);
    var arr = itemMap.get(cleaned.itemName) as VariantLine[];
    arr.push({ weight: cleaned.weight, price: it.martinsPrice });
  });

  var categoryNames = Array.from(byCategory.keys()).sort(function (a, b) {
    var mapA = byCategory.get(a) as Map<string, VariantLine[]>;
    var mapB = byCategory.get(b) as Map<string, VariantLine[]>;
    return mapB.size - mapA.size;
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
        <p className="mb-4 text-[10px] text-[#94A3B8]">Categorias e itens com maior oportunidade comercial</p>

        {categoryNames.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-card">
            <p className="text-[11px] text-ink-600">Nenhuma oportunidade identificada no momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {categoryNames.map(function (category) {
              var itemMap = byCategory.get(category) as Map<string, VariantLine[]>;
              var itemNames = Array.from(itemMap.keys()).sort();

              return (
                <div key={category} className="rounded-xl bg-white p-4 shadow-card">
                  <h3 className="text-[12px] font-semibold text-[#1F2937]">
                    {emojiFor(category)} {category.toUpperCase()}
                  </h3>

                  <div className="mt-2 flex flex-col gap-2">
                    {itemNames.map(function (itemName) {
                      var variants = itemMap.get(itemName) as VariantLine[];
                      return (
                        <div key={itemName}>
                          <div className="text-[10px] font-medium text-[#1F2937]">{itemName}</div>
                          <ul className="mt-0.5 space-y-0.5 pl-3">
                            {variants.map(function (v, idx) {
                              return (
                                <li key={idx} className="flex items-center justify-between text-[10px] text-[#6B7280]">
                                  <span>{v.weight ? v.weight : "-"}</span>
                                  <span className="font-semibold text-[#16A34A]">
                                    {v.price !== undefined ? money(v.price) : "-"}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SalesMessageModal open={messageOpen} onClose={function () { setMessageOpen(false); }} items={items} />
    </div>
  );
}
