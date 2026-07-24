"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { DisadvantageItem } from "./Charts";
import { SalesMessageModal } from "./SalesMessageModal";
import { buildVendasGroups, MAX_ITEMS_PER_LINE } from "@/lib/vendasGrouping";

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

  var groups = buildVendasGroups(items);

  return (
    <div className="mx-auto flex max-w-[1400px] w-[95%] flex-col gap-3 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[16px] font-bold text-[#1F2937]">Vendas</h1>
          {industryName ? (
            <p className="mt-0.5 text-[10px] font-medium text-[#2563EB]">🏭 Industria: {industryName}</p>
          ) : null}
          <p className="mt-0.5 text-[9px] text-[#94A3B8]">Todos os precos exibidos sao unitarios.</p>
        </div>
        <button
          onClick={function () { setMessageOpen(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-good px-3.5 py-2 text-[11px] font-bold text-white hover:opacity-90"
        >
          <MessageCircle size={13} />
          Gerar mensagem para Vendas
        </button>
      </div>

      {groups.categoryNames.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-card">
          <p className="text-[11px] text-ink-600">Nenhuma oportunidade identificada no momento.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.categoryNames.map(function (category) {
            var brandMap = groups.byCategory.get(category);
            var tipoMap = groups.tipoByCategoryBrand.get(category);
            if (!brandMap) return null;
            var brandNames = Array.from(brandMap.keys()).sort();

            return (
              <div key={category} className="rounded-xl bg-white p-3.5 shadow-card">
                <h2 className="text-[13px] font-bold text-[#1F2937]">
                  {emojiFor(category)} {category.toUpperCase()}
                </h2>

                <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {brandNames.map(function (brand) {
                    var safeBrandMap = brandMap as Map<string, Map<string, { label: string; price: number | undefined }[]>>;
                    var lineMap = safeBrandMap.get(brand) as Map<string, { label: string; price: number | undefined }[]>;
                    var lineKeys = Array.from(lineMap.keys()).sort();
                    var uniformTipo = tipoMap ? tipoMap.get(brand) : null;

                    return lineKeys.map(function (lineKey) {
                      var variants = lineMap.get(lineKey) as { label: string; price: number | undefined }[];
                      var shown = variants.slice(0, MAX_ITEMS_PER_LINE);
                      var remaining = variants.length - shown.length;

                      return (
                        <div key={brand + "-" + lineKey} className="border-b border-line/40 pb-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-wide text-[#2563EB]">{brand}</div>
                          {uniformTipo ? <div className="text-[9px] text-[#94A3B8]">{uniformTipo}</div> : null}
                          <div className="text-[10px] font-medium text-[#1F2937]">{lineKey}</div>
                          <ul className="mt-0.5">
                            {shown.map(function (v, idx) {
                              return (
                                <li key={idx} className="flex items-center justify-between text-[10px] text-[#6B7280]">
                                  <span>{v.label}</span>
                                  <span className="font-bold text-good">
                                    {v.price !== undefined ? money(v.price) : "-"}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                          {remaining > 0 ? (
                            <div className="mt-0.5 text-[9px] text-[#94A3B8]">+{remaining} itens disponiveis</div>
                          ) : null}
                        </div>
                      );
                    });
                  })}
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
