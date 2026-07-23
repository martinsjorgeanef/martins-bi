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
        <p className="text-[14px] text-ink-600">Carregando...</p>
      </div>
    );
  }

  var byCategory = new Map<string, Map<string, Map<string, VariantLine[]>>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description);

    if (!byCategory.has(category)) byCategory.set(category, new Map());
    var brandMap = byCategory.get(category) as Map<string, Map<string, VariantLine[]>>;

    if (!brandMap.has(cleaned.brand)) brandMap.set(cleaned.brand, new Map());
    var itemMap = brandMap.get(cleaned.brand) as Map<string, VariantLine[]>;

    if (!itemMap.has(cleaned.itemName)) itemMap.set(cleaned.itemName, []);
    var arr = itemMap.get(cleaned.itemName) as VariantLine[];
    arr.push({ weight: cleaned.weight, price: it.martinsPrice });
  });

  var categoryNames = Array.from(byCategory.keys()).sort();

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-ink-950 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white">
            <ArrowLeft size={15} />
            Voltar ao painel
          </Link>
          <button
            onClick={function () { setMessageOpen(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-good px-3 py-2 text-[13px] font-semibold text-white hover:opacity-90"
          >
            <MessageCircle size={15} />
            Gerar mensagem para Vendas
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-[20px] font-bold text-[#1F2937]">🔥 Oportunidades do Dia</h1>

        {categoryNames.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-card">
            <p className="text-[13px] text-ink-600">Nenhuma oportunidade identificada no momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {categoryNames.map(function (category) {
              var brandMap = byCategory.get(category) as Map<string, Map<string, VariantLine[]>>;
              var brandNames = Array.from(brandMap.keys()).sort();

              return (
                <div key={category} className="rounded-xl bg-white p-4 shadow-card">
                  <h2 className="text-[16px] font-bold text-[#1F2937]">
                    {emojiFor(category)} {category.toUpperCase()}
                  </h2>

                  <div className="mt-3 flex flex-col gap-3">
                    {brandNames.map(function (brand) {
                      var itemMap = brandMap.get(brand) as Map<string, VariantLine[]>;
                      var itemNames = Array.from(itemMap.keys()).sort();

                      return (
                        <div key={brand}>
                          <div className="text-[13px] font-bold uppercase tracking-wide text-[#2563EB]">{brand}</div>
                          <ul className="mt-1 space-y-1 pl-1">
                            {itemNames.map(function (itemName) {
                              var variants = itemMap.get(itemName) as VariantLine[];
                              return variants.map(function (v, idx) {
                                var label = v.weight ? itemName + " " + v.weight : itemName;
                                return (
                                  <li key={itemName + idx} className="flex items-center justify-between gap-2 text-[13px]">
                                    <span className="text-[#1F2937]">{label}</span>
                                    <span className="font-bold text-[#16A34A]">
                                      {v.price !== undefined ? money(v.price) : "-"}
                                    </span>
                                  </li>
                                );
                              });
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
