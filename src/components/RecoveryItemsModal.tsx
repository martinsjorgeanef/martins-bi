"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ProductRow } from "@/lib/types";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function tierColor(discountPct: number): string {
  if (discountPct <= 2) return "#16A34A";
  if (discountPct <= 5) return "#D97706";
  return "#DC2626";
}

function tierEmoji(discountPct: number): string {
  if (discountPct <= 2) return "🟢";
  if (discountPct <= 5) return "🟡";
  return "🔴";
}

export function RecoveryItemsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    if (!open) return;
    setLoading(true);
    fetch("/api/products?status=DESVANTAGEM&pageSize=500&sortBy=diffPct&sortDir=asc")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setItems(data.rows || []);
        setLoading(false);
      });
  }, [open]);

  if (!open) return null;

  var sorted = items.slice().sort(function (a, b) {
    return (a.requiredDiscountPct || 0) - (b.requiredDiscountPct || 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#1F2937]">Itens recuperáveis com desconto</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-[13px] text-ink-600">Carregando...</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-[11px] uppercase tracking-wide text-[#94A3B8]">
                  <th className="pb-2 pr-2 font-medium">Produto</th>
                  <th className="pb-2 pr-2 text-right font-medium">Preço Martins</th>
                  <th className="pb-2 pr-2 text-right font-medium">Preço Concorrente</th>
                  <th className="pb-2 text-right font-medium">Desconto necessário</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(function (r) {
                  var pct = (r.requiredDiscountPct || 0) * 100;
                  return (
                    <tr key={r.id} className="border-t border-line/50">
                      <td className="py-1.5 pr-2 text-[12px] text-[#1F2937]" title={r.description}>
                        {r.description}
                      </td>
                      <td className="py-1.5 pr-2 text-right text-[12px] tabular-nums text-[#1F2937]">
                        {money(r.martinsPrice)}
                      </td>
                      <td className="py-1.5 pr-2 text-right text-[12px] tabular-nums text-[#6B7280]">
                        {r.marketPrice !== null ? money(r.marketPrice) : "-"}
                      </td>
                      <td className="py-1.5 text-right text-[12px] font-semibold" style={{ color: tierColor(pct) }}>
                        {tierEmoji(pct)} {pct.toFixed(1).replace(".", ",")}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
