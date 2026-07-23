"use client";

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
      <h3 className="text-[16px] font-semibold text-ink-950">Distribuicao de competitividade</h3>
      <p className="mt-0.5 text-[12px] text-ink-500">Produtos com dados de mercado, por status</p>

      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-line">
        {data.map((d) =>
          total > 0 && d.value > 0 ? (
            <div key={d.key} style={{ width: (d.value / total) * 100 + "%", background: STATUS_COLORS[d.key] }} />
          ) : null
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-1.5 text-[13px]">
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

export interface DisadvantageItem {
  ean: string;
  description: string;
  category: string | null;
  diffPct: number;
}

export function TopDisadvantageChart({ data }: { data: DisadvantageItem[] }) {
  const top5 = data.slice(0, 5);

  if (top5.length === 0 || top5.every((d) => d.diffPct >= 5)) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[16px] font-semibold text-ink-950">Maiores desvantagens de preco</h3>
        <div className="mt-3 flex h-[80px] items-center justify-center text-[13px] text-ink-600">
          Nenhum produto em desvantagem relevante
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-[16px] font-semibold text-ink-950">Maiores desvantagens de preco</h3>
      <p className="mt-0.5 text-[12px] text-ink-500">Os 5 itens mais criticos</p>

      <div className="mt-2 flex flex-col">
        {top5.map((d) => (
          <div key={d.ean} className="border-b border-line/60 py-2 last:border-b-0">
            <div className="flex items-baseline gap-1.5">
              <span className="shrink-0 font-mono text-[11px] text-ink-500">{d.ean}</span>
              <span className="truncate text-[12px] text-ink-950" title={d.description}>
                {d.description}
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-ink-500">
                {d.category ? "Categoria: " + d.category : "Sem categoria"}
              </span>
              <span className="shrink-0 text-[13px] font-bold text-bad">{d.diffPct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
