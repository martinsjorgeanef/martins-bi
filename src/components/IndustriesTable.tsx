"use client";

import { IndustryRow } from "@/lib/types";
import { clsx } from "clsx";

interface Props {
  industries: IndustryRow[];
  hasCadger: boolean;
}

function Square({
  label,
  value,
  sub,
  accent
}: {
  label: string;
  value: string;
  sub: string;
  accent: "accent" | "warn" | "good" | "bad" | "ink";
}) {
  const accentClasses: Record<string, string> = {
    accent: "text-accent-dark",
    warn: "text-warn",
    good: "text-good",
    bad: "text-bad",
    ink: "text-ink-700"
  };

  return (
    <div className="flex h-[64px] flex-col items-center justify-center rounded-md border border-line bg-white px-1.5 py-1 text-center">
      <span className="text-[9px] font-semibold uppercase tracking-wide text-ink-500">{label}</span>
      <span className={clsx("font-display text-base font-bold tabular-nums leading-tight", accentClasses[accent])}>
        {value}
      </span>
      <span className="text-[8px] leading-tight text-ink-500">{sub}</span>
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
      <p className="mt-0.5 text-[11px] text-ink-600">
        Quanto a Martins tem ativo contra quanto o concorrente tem cadastrado
      </p>

      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((i) => {
          const indisponivel = i.itensConcorrenteCadastrados - i.itensConcorrenteComPreco;
          const diferencaLabel = i.diferenca > 0 ? `+${i.diferenca}` : `${i.diferenca}`;
          const diferencaSub =
            i.diferenca > 0 ? "conc. tem mais" : i.diferenca < 0 ? "Martins tem mais" : "empatado";
          const diferencaAccent = i.diferenca > 0 ? "bad" : i.diferenca < 0 ? "good" : "ink";

          return (
            <div key={i.fornecedor} className="rounded-md border border-line bg-surface/50 p-2">
              <div className="mb-1.5 truncate text-[11px] font-semibold text-ink-950" title={i.fornecedor}>
                {i.fornecedor}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <Square
                  label="Martins"
                  value={String(i.itensMartins)}
                  sub={`${i.cadastrados} cad · ${i.ruptura} rupt`}
                  accent="accent"
                />
                <Square
                  label="Concorrente"
                  value={String(i.itensConcorrenteCadastrados)}
                  sub={`${indisponivel} indisp.`}
                  accent="warn"
                />
                <Square
                  label="Diferença"
                  value={diferencaLabel}
                  sub={diferencaSub}
                  accent={diferencaAccent as "good" | "bad" | "ink"}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
