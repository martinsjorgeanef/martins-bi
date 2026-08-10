"use client";

import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";

interface MissingItem {
  ean: string;
  description: string;
  price: number | null;
  competitorName: string;
}

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function MissingItemsPanel({ fornecedor }: { fornecedor: string | undefined }) {
  const [items, setItems] = useState<MissingItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(function () {
    if (!fornecedor) {
      setItems([]);
      return;
    }
    setLoading(true);
    fetch("/api/competitors/missing-items?fornecedor=" + encodeURIComponent(fornecedor))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setItems(data.missing || []);
        setLoading(false);
      })
      .catch(function () { setLoading(false); });
  }, [fornecedor]);

  if (!fornecedor) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-center gap-2">
        <PackageSearch size={16} className="text-accent" />
        <h3 className="text-[13px] font-semibold text-[#1F2937]">
          Itens que o concorrente tem e a Martins nao tem ({items.length})
        </h3>
      </div>
      <p className="mt-0.5 text-[11px] text-[#6B7280]">
        Produtos do concorrente para {fornecedor}, sem equivalente cadastrado no catalogo Martins. Avaliar oportunidade de ampliacao de mix.
      </p>

      {loading ? (
        <p className="mt-3 text-[12px] text-ink-600">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-[12px] text-ink-600">Nenhum item exclusivo do concorrente encontrado para este fornecedor.</p>
      ) : (
        <div className="mt-3 max-h-[400px] overflow-y-auto rounded-lg border border-line">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-surface">
              <tr>
                <th className="whitespace-nowrap px-2.5 py-1.5 text-left text-[11px] font-semibold text-ink-600">EAN</th>
                <th className="px-2.5 py-1.5 text-left text-[11px] font-semibold text-ink-600">Descricao</th>
                <th className="whitespace-nowrap px-2.5 py-1.5 text-left text-[11px] font-semibold text-ink-600">Concorrente</th>
                <th className="whitespace-nowrap px-2.5 py-1.5 text-right text-[11px] font-semibold text-ink-600">Preco</th>
              </tr>
            </thead>
            <tbody>
              {items.map(function (item, idx) {
                var rowBg = idx % 2 === 1 ? "#F8FAFC" : "#FFFFFF";
                return (
                  <tr key={item.ean + item.competitorName} className="border-t border-line/50" style={{ background: rowBg }}>
                    <td className="whitespace-nowrap px-2.5 py-1.5 font-mono text-[11px] text-ink-700">{item.ean}</td>
                    <td className="px-2.5 py-1.5 text-[12px] text-ink-950">{item.description}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-[12px] text-ink-700">{item.competitorName}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-right text-[12px] font-medium tabular-nums text-ink-950">
                      {item.price !== null ? money(item.price) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
