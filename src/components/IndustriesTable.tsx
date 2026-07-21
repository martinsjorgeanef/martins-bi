"use client";

import { IndustryRow } from "@/lib/types";

interface Props {
  industries: IndustryRow[];
  hasCadger: boolean;
}

export function IndustriesTable({ industries, hasCadger }: Props) {
  if (!hasCadger) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white p-6 text-center">
        <h3 className="font-display text-sm font-semibold text-ink-950">Visão por indústria</h3>
        <p className="mt-1 text-sm text-ink-600">
          Envie a planilha CADGER (botão "Enviar planilha") para ver quantos itens cada fornecedor tem
          cadastrado, a ruptura e a cobertura do concorrente.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white shadow-card">
      <div className="border-b border-line p-4">
        <h3 className="font-display text-sm font-semibold text-ink-950">Visão por indústria</h3>
        <p className="mt-0.5 text-xs text-ink-600">
          Cadastrados no CADGER x com preço ativo x cadastrados no concorrente importado
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-600">
                Fornecedor
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-600">
                Cadastrados
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-600">
                Com preço ativo
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-600">
                Ruptura
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-600">
                Concorrente cadastrado
              </th>
            </tr>
          </thead>
          <tbody>
            {industries.map((i) => (
              <tr key={i.fornecedor} className="border-b border-line/60 hover:bg-surface/60">
                <td className="px-4 py-3 text-sm font-medium text-ink-950">{i.fornecedor}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-ink-950">{i.cadastrados}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-ink-700">{i.comPrecoAtivo}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums">
                  <span className={i.ruptura > 0 ? "font-semibold text-bad" : "text-ink-500"}>
                    {i.ruptura} {i.cadastrados > 0 ? `(${i.rupturaPct.toFixed(0)}%)` : ""}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-ink-700">
                  {i.concorrenteCadastrado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
