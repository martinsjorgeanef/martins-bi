"use client";

import { TrendingDown } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  COMPETITIVO: "#16A34A",
  ATENCAO: "#D97706",
  DESVANTAGEM: "#DC2626"
};

export function StatusDistributionChart({
  data
}: {
  data: { name: string; value: number; key: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="font-display text-xs font-semibold text-ink-950">Distribuição de competitividade</h3>
      <p className="mt-0.5 text-[11px] text-ink-500">Produtos com dados de mercado, por status</p>

      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-line">
        {data.map(
          (d) =>
            total > 0 &&
            d.value > 0 && (
              <div
                key={d.key}
                style={{ width: `${(d.value / total) * 100}%`, background: STATUS_COLORS[d.key] }}
              />
            )
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[d.key] }} />
            <span className="font-semibold tabular-nums text-ink-950">{d.value}</span>
            <span className="text-ink-600">
              {d.name} ({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const RANK_STYLES = [
  { badge: "bg-bad text-white", ring: "ring-2 ring-bad/30" },
  { badge: "bg-bad/85 text-white", ring: "ring-1 ring-bad/20" },
  { badge: "bg-bad/70 text-white", ring: "" }
];

export function TopDisadvantageChart({
  data
}: {
  data: { ean: string; description: string; diffPct: number; martinsPrice?: number; marketPrice?: number }[];
}) {
  if (data.length === 0 || data.every((d) => d.diffPct >= 5)) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="font-display text-xs font-semibold text-ink-950">Maiores desvantagens de preço</h3>
        <div className="mt-4 flex h-[100px] items-center justify-center text-xs text-ink-600">
          Nenhum produto em desvantagem relevante 🎉
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-950">Maiores desvantagens de preço</h3>
        <span className="text-[11px] text-ink-500">Top {Math.min(data.length, 10)}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-ink-500">Onde agir primeiro — Martins x concorrente</p>

      <div className="mt-3 flex flex-col gap-1.5">
        {data.map((d, idx) => {
          const isTop3 = idx < 3;
          const rank = RANK_STYLES[idx] ?? { badge: "bg-ink-500/10 text-ink-600", ring: "" };
          return (
            <div
              key={d.ean}
              className={`flex items-center gap-3 rounded-lg bg-surface/60 px-3 py-2 ${isTop3 ? rank.ring : ""}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${rank.badge}`}
              >
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-ink-950" title={d.description}>
                  {d.description}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-ink-500">
                  <span className="font-mono">{d.ean}</span>
                  {d.martinsPrice !== undefined && d.marketPrice !== undefined && (
                    <span>
                      {money(d.martinsPrice)} <span className="text-ink-400">vs</span> {money(d.marketPrice)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-sm font-bold tabular-nums text-bad">
                <TrendingDown size={13} />
                {d.diffPct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
