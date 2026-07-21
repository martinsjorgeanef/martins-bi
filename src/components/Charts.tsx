"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

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
    <div className="rounded-xl border border-line bg-white p-4 shadow-card">
      <h3 className="font-display text-sm font-semibold text-ink-950">Distribuição de competitividade</h3>
      <p className="mt-0.5 text-xs text-ink-600">Produtos com dados de mercado, por status</p>
      <div className="mt-2 flex items-center gap-4">
        <div className="h-[160px] w-[160px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} produtos (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2">
          {data.map((d) => (
            <div key={d.key} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[d.key] }} />
              <span className="text-ink-700">{d.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-ink-950">{d.value}</span>
            </div>
          ))}
        </div>
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
      <div className="rounded-xl border border-line bg-white p-4 shadow-card">
        <h3 className="font-display text-sm font-semibold text-ink-950">Maiores desvantagens de preço</h3>
        <div className="mt-6 flex h-[180px] items-center justify-center text-sm text-ink-600">
          Nenhum produto em desvantagem relevante 🎉
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-card">
      <h3 className="font-display text-sm font-semibold text-ink-950">Maiores desvantagens de preço</h3>
      <p className="mt-0.5 text-xs text-ink-600">% de diferença Martins x mercado (negativo = mais caro)</p>
      <div className="mt-2 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="description"
              width={140}
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <Tooltip formatter={(v: number) => [`${v}%`, "Diferença"]} />
            <Bar dataKey="diffPct" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.diffPct < 0 ? "#DC2626" : "#D97706"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
