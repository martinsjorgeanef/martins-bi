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
      <h3 className="text-[16px] font-semibold text-ink-950">Distribuição de competitividade</h3>
      <p className="mt-0.5 text-[12px] text-ink-500">Produtos com dados de mercado, por status</p>

      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-line">
        {data.map(
          (d) =>
            total > 0 &&
            d.value > 0 && (
              <div key={d.key} style={{ width: `${(d.value / total) * 100}%`, background: STATUS_COLORS[d.key] }} />
            )
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
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

export function TopDisadvantageChart({
  data
}: {
  data: { ean: string; description: string; diffPct: number }[];
}) {
  if (data.length === 0 || data.every((d) => d.diffPct >= 5)) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[16px] font-semibold text-ink-950">Maiores desvantagens de preço</h3>
        <div className="mt-4 flex h-[100px] items-center justify-center text-[13px] text-ink-600">
          Nenhum produto em desvantagem relevante 🎉
        </div>
      </div>
    );
  }

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.diffPct)), 1);

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[16px] font-semibold text-ink-950">Maiores desvantagens de preço</h3>
        <span className="text-[12px] text-ink-500">Top {Math.min(data.length, 10)}</span>
      </div>
      <p className="mt-0.5 text-[12px] text-ink-500">Onde agir primeiro</p>

      <div className="mt-4 flex flex-col gap-3">
        {data.map((d, idx) => {
          const widthPct = (Math.abs(d.diffPct) / maxAbs) * 100;
          const intensity = idx === 0 ? "bg-bad" : idx < 3 ? "bg-bad/80" : "bg-bad/50";
          return (
            <div key={d.ean}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-950 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="truncate text-[13px] font-medium text-ink-950" title={d.description}>
                    {d.description}
                  </span>
                </div>
                <span className="shrink-0 text-[16px] font-bold tabular-nums text-bad">{d.diffPct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-line">
                <div className={`h-full rounded-full ${intensity}`} style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
