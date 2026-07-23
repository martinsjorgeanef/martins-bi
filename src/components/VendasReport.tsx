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

interface FlatItem {
  label: string;
  price: number | undefined;
}

export function VendasReport() {
  const [items, setItems] = useState<DisadvantageItem[]>([]);
  const [industryName, setIndustryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);

  useEffect(function () {
    Promise.all([
      fetch("/api/stats").then(function (r) { return r.json(); }),
      fetch("/api/industries").then(function (r) { return r.json(); })
    ]).then(function (results) {
      var stats = results[0];
      var ind = results[1];
      setItems(stats.topAdvantage || []);
      var industries = ind.industries || [];
      setIndustryName(industries.length > 0 ? industries[0].fornecedor : null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-[14px] text-ink-600">Carregando...</p>
      </div>
    );
  }

  var byCategory = new Map<string, Map<string, Map<string, FlatItem[]>>>();
  var byCategoryFlat = new Map<string, Map<string, FlatItem[]>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description);
    var line = cleaned.weight ? cleaned.descriptor + " " + cleaned.weight : cleaned.descriptor;
    var label = line.trim().length > 0 ? line.trim() : cleaned.weight || "";

    if (cleaned.linha) {
      if (!byCategory.has(category)) byCategory.set(category, new Map());
      var brandMap = byCategory.get(category) as Map<string, Map<string, FlatItem[]>>;
      if (!brandMap.has(cleaned.brand)) brandMap.set(cleaned.brand, new Map());
      var lineMap = brandMap.get(cleaned.brand) as Map<string, FlatItem[]>;
      if (!lineMap.has(cleaned.linha)) lineMap.set(cleaned.linha, []);
      (lineMap.get(cleaned.linha) as FlatItem[]).push({ label: label, price: it.martinsPrice });
    } else {
      if (!byCategoryFlat.has(category)) byCategoryFlat.set(category, new Map());
      var flatBrandMap = byCategoryFlat.get(category) as Map<string, FlatItem[]>;
      if (!flatBrandMap.has(cleaned.brand)) flatBrandMap.set(cleaned.brand, []);
      var flatLabel = cleaned.tipo ? cleaned.tipo + " " + label : label;
      (flatBrandMap.get(cleaned.brand) as FlatItem[]).push({ label: flatLabel, price: it.martinsPrice });
    }
  });

  var allCategoryNames = new Set<string>();
  Array.from(byCategory.keys()).forEach(function (c) { allCategoryNames.add(c); });
  Array.from(byCategoryFlat.keys()).forEach(function (c) { allCategoryNames.add(c); });
  var categoryNames = Array.from(allCategoryNames).sort();

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
        <h1 className="text-[20px] font-bold text-[#1F2937]">🔥 Oportunidades do Dia</h1>
        {industryName ? (
          <p className="mt-1 text-[13px] font-medium text-[#2563EB]">🏭 Industria: {industryName}</p>
        ) : null}

        {categoryNames.length === 0 ? (
          <div className="mt-4 rounded-xl bg-white p-6 text-center shadow-card">
            <p className="text-[13px] text-ink-600">Nenhuma oportunidade identificada no momento.</p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {categoryNames.map(function (category) {
              var brandMap = byCategory.get(category);
              var flatBrandMap = byCategoryFlat.get(category);

              return (
                <div key={category} className="rounded-xl bg-white p-4 shadow-card">
                  <h2 className="text-[16px] font-bold text-[#1F2937]">
                    {emojiFor(category)} {category.toUpperCase()}
                  </h2>

                  <div className="mt-3 flex flex-col gap-3">
                    {brandMap
                      ? Array.from(brandMap.keys())
                          .sort()
                          .map(function (brand) {
                            var lineMap = brandMap.get(brand) as Map<string, FlatItem[]>;
                            var lineNames = Array.from(lineMap.keys()).sort();
                            return (
                              <div key={brand}>
                                <div className="text-[13px] font-bold uppercase tracking-wide text-[#2563EB]">{brand}</div>
                                {lineNames.map(function (lineName) {
                                  var arr = lineMap.get(lineName) as FlatItem[];
                                  return (
                                    <div key={lineName} className="mt-1">
                                      <div className="text-[13px] font-semibold text-[#1F2937]">{lineName}</div>
                                      <ul className="mt-0.5 space-y-1 pl-1">
                                        {arr.map(function (it, idx) {
                                          return (
                                            <li key={idx} className="flex items-center justify-between gap-2 text-[13px]">
                                              <span className="text-[#1F2937]">{it.label}</span>
                                              <span className="font-bold text-[#16A34A]">
                                                {it.price !== undefined ? money(it.price) + " Un." : "-"}
                                              </span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })
                      : null}

                    {flatBrandMap
                      ? Array.from(flatBrandMap.keys())
                          .sort()
                          .map(function (brand) {
                            var arr = flatBrandMap.get(brand) as FlatItem[];
                            return (
                              <div key={brand}>
                                <div className="text-[13px] font-bold uppercase tracking-wide text-[#2563EB]">{brand}</div>
                                <ul className="mt-1 space-y-1 pl-1">
                                  {arr.map(function (it, idx) {
                                    return (
                                      <li key={idx} className="flex items-center justify-between gap-2 text-[13px]">
                                        <span className="text-[#1F2937]">{it.label}</span>
                                        <span className="font-bold text-[#16A34A]">
                                          {it.price !== undefined ? money(it.price) + " Un." : "-"}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })
                      : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SalesMessageModal
        open={messageOpen}
        onClose={function () { setMessageOpen(false); }}
        items={items}
        industryName={industryName}
      />
    </div>
  );
}
