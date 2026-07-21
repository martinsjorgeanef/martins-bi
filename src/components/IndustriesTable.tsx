"use client";

import { IndustryRow } from "@/lib/types";

interface Props {
  industries: IndustryRow[];
  hasCadger: boolean;
}

export function IndustriesTable({ industries, hasCadger }: Props) {
  if (!hasCadger) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white p-4 text-center">
        <h3 className="font-display text-xs font-semibold text-ink-950">Visão por indústria</h3>
        <p className="mt-1 text-xs text-ink-600">
          Envie a planilha de um concorrente (ex: Colgate, Johnson & Johnson) para ver aqui a comparação
          daquela indústria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white shadow-card">
      <div className="border-b border-line p-3">
        <h3 className="font-display text-xs font-semibold text-ink-950">Visão por indústria</h3>
        <p className="mt-0.5 text-[11px] text-ink-600">
          Cadastrados (CADGER) x itens ativos na Martins x cadastrados/com preço no concorrente
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead className="bg-surface">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Fornecedor
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Cadastrados
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Itens Martins
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Concorrente cadastrado
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Concorrente c/ preço
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Diferença
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Ruptura
              </th>
            </tr>
          </thead>
          <tbody>
            {industries.map((i) => (
              <tr key={i.fornecedor} className="border-b border-line/60 hover:bg-surface/60">
                <td className="px-3 py-2 text-xs font-medium text-ink-950">{i.fornecedor}</td>
                <td className="px-3 py-2 text-right text-xs tabular-nums text-ink-700">{i.cadastrados}</td>
                <td className="px-3 py-2 text-right text-xs font-medium tabular-nums text-ink-950">{i.itensMartins}</td>
                <td className="px-3 py-2 text-right text-xs tabular-nums text-ink-700">
                  {i.itensConcorrenteCadastrados}
                </td>
                <td className="px-3 py-2 text-right text-xs tabular-nums text-ink-700">
                  {i.itensConcorrenteComPreco}
                </td>
                <td className="px-3 py-2 text-right text-xs tabular-nums">
                  <span className={i.diferenca > 0 ? "font-semibold text-bad" : i.diferenca < 0 ? "font-semibold text-good" : "text-ink-500"}>
                    {i.diferenca > 0 ? "+" : ""}
                    {i.diferenca}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-xs tabular-nums text-ink-500">{i.ruptura}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
