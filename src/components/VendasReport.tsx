"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
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
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-[13px] text-ink-600">Carregando...</p>
      </div>
    );
  }

  var byCategory = new Map<string, Map<string, Map<string, VariantLine[]>>>();
  var byCategoryFlat = new Map<string, Map<string, VariantLine[]>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description);
    var line = cleaned.weight ? cleaned.descriptor + " " + cleaned.weight : cleaned.descriptor;
    var label = line.trim().length > 0 ? line.trim() : cleaned.weight || "";

    if (cleaned.linha) {
      if (!byCategory.has(category)) byCategory.set(category, new Map());
      var brandMapBuild = byCategory.get(category) as Map<string, Map<string, VariantLine[]>>;
      if (!brandMapBuild.has(cleaned.brand)) brandMapBuild.set(cleaned.brand, new Map());
      var lineMapBuild = brandMapBuild.get(cleaned.brand) as Map<string, VariantLine[]>;
      if (!lineMapBuild.has(cleaned.linha)) lineMapBuild.set(cleaned.linha, []);
      (lineMapBuild.get(cleaned.linha) as VariantLine[]).push({ weight: cleaned.weight, price: it.martinsPrice });
    } else {
      if (!byCategoryFlat.has(category)) byCategoryFlat.set(category, new Map());
      var flatBrandMapBuild = byCategoryFlat.get(category) as Map<string, VariantLine[]>;
      if (!flatBrandMapBuild.has(cleaned.brand)) flatBrandMapBuild.set(cleaned.brand, []);
      (flatBrandMapBuild.get(cleaned.brand) as VariantLine[]).push({ weight: cleaned.weight, price: it.martinsPrice });
    }
  });

  var allCategoryNames = new Set<string>();
  Array.from(byCategory.keys()).forEach(function (c) { allCategoryNames.add(c); });
  Array.from(byCategoryFlat.keys()).forEach(function (c) { allCategoryNames.add(c); });
  var categoryNames = Array.from(allCategoryNames).sort();

  return (
    <div className="mx-auto flex max-w-[1400px] w-[95%] flex-col gap-3 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[16px] font-bold text-[#1F2937]">Vendas</h1>
          {industryName ? (
            <p className="mt-0.5 text-[10px] font-medium text-[#2563EB]">🏭 Industria: {industryName}</p>
          ) : null}
        </div>
        <button
          onClick={function () { setMessageOpen(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-good px-3.5 py-2 text-[11px] font-bold text-white hover:opacity-90"
        >
          <MessageCircle size={13} />
          Gerar mensagem para Vendas
        </button>
      </div>

      {categoryNames.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-card">
          <p className="text-[11px] text-ink-600">Nenhuma oportunidade identificada no momento.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categoryNames.map(function (category) {
            var brandMap = byCategory.get(category);
            var flatBrandMap = byCategoryFlat.get(category);

            return (
              <div key={category} className="rounded-xl bg-white p-3.5 shadow-card">
                <h2 className="text-[13px] font-bold text-[#1F2937]">
                  {emojiFor(category)} {category.toUpperCase()}
                </h2>

                <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {brandMap
                    ? Array.from(brandMap.keys())
                        .sort()
                        .map(function (brand) {
                          var safeBrandMap = brandMap as Map<string, Map<string, VariantLine[]>>;
                          var lineMap = safeBrandMap.get(brand) as Map<string, VariantLine[]>;
                          var lineNames = Array.from(lineMap.keys()).sort();
                          return lineNames.map(function (lineName) {
                            var variants = lineMap.get(lineName) as VariantLine[];
                            return (
                              <div key={brand + "-" + lineName} className="border-b border-line/40 pb-1.5">
                                <div className="text-[9px] font-bold uppercase tracking-wide text-[#2563EB]">{brand}</div>
                                <div className="text-[10px] font-medium text-[#1F2937]">{lineName}</div>
                                <ul className="mt-0.5">
                                  {variants.map(function (v, idx) {
                                    return (
                                      <li key={idx} className="flex items-center justify-between text-[10px] text-[#6B7280]">
                                        <span>{v.weight ? v.weight : "-"}</span>
                                        <span className="font-bold text-good">
                                          {v.price !== undefined ? money(v.price) : "-"}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          });
                        })
                    : null}

                  {flatBrandMap
                    ? Array.from(flatBrandMap.keys())
                        .sort()
                        .map(function (brand) {
                          var safeFlatBrandMap = flatBrandMap as Map<string, VariantLine[]>;
                          var arr = safeFlatBrandMap.get(brand) as VariantLine[];
                          return (
                            <div key={brand} className="border-b border-line/40 pb-1.5">
                              <div className="text-[9px] font-bold uppercase tracking-wide text-[#2563EB]">{brand}</div>
                              <ul className="mt-0.5">
                                {arr.map(function (v, idx) {
                                  return (
                                    <li key={idx} className="flex items-center justify-between text-[10px] text-[#6B7280]">
                                      <span>{v.weight ? v.weight : "-"}</span>
                                      <span className="font-bold text-good">
                                        {v.price !== undefined ? money(v.price) : "-"}
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

      <SalesMessageModal
        open={messageOpen}
        onClose={function () { setMessageOpen(false); }}
        items={items}
        industryName={industryName}
      />
    </div>
  );
}
