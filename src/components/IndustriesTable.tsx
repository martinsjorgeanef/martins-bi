"use client";

import { IndustryRow } from "@/lib/types";
import { clsx } from "clsx";

interface Props {
  industries: IndustryRow[];
  hasCadger: boolean;
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded border border-line bg-white px-1 py-1">
      <span className={clsx("text-sm font-bold tabular-nums leading-none", accent)}>{value}</span>
      <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wide text-ink-500 leading-none">
        {label}
      </span>
    </div>
  );
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
    <div className="rounded-lg border border-line bg-white p-3 shadow-card">
      <h3 className="font-display text-xs font-semibold text-ink-950">Visão por indústria</h3>
      <p className="mt-0.5 text-[11px] text-ink-600">Martins ativo x concorrente cadastrado, por indústria</p>

      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((i) => {
          const diferencaLabel = i.diferenca > 0 ? `+${i.diferenca}` : `${i.diferenca}`;
          const diferencaAccent =
            i.diferenca > 0 ? "text-bad" : i.diferenca < 0 ? "text-good" : "text-ink-500";

          return (
            <div
              key={i.fornecedor}
              className="flex items-center gap-2 rounded-md border border-line bg-surface/50 p-1.5"
            >
              <div className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink-950" title={i.fornecedor}>
                {i.fornecedor}
              </div>
              <div className="flex shrink-0 gap-1">
                <Stat label="Martins" value={String(i.itensMartins)} accent="text-accent-dark" />
                <Stat label="Concor." value={String(i.itensConcorrenteCadastrados)} accent="text-warn" />
                <Stat label="Difer." value={diferencaLabel} accent={diferencaAccent} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
