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
    <div className="rounded-lg border border-line bg-white p-3 shadow-card">
      <h3 className="font-display text-xs font-semibold text-ink-950">Distribuição de competitividade</h3>
      <p className="mt-0.5 text-[11px] text-ink-600">Produtos com dados de mercado, por status</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={34} outerRadius={55} paddingAngle={2} stroke="none">
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
        <div className="flex flex-col gap-1.5">
          {data.map((d) => (
            <div key={d.key} className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[d.key] }} />
              <span className="text-ink-700">{d.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-ink-950">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function truncateLabel(text: string, max: number) {
  if (text.length > max) {
    return text.slice(0, max) + "…";
  }
  return text;
}

export function TopDisadvantageChart({
  data
}: {
  data: { ean: string; description: string; diffPct: number }[];
}) {
  const trimmed = data.slice(0, 6).map((d) => ({ ...d, description: truncateLabel(d.description, 13) }));

  if (trimmed.length === 0 || trimmed.every((d) => d.diffPct >= 5)) {
    return (
      <div className="rounded-lg border border-line bg-white p-3 shadow-card">
        <h3 className="font-display text-xs font-semibold text-ink-950">Maiores desvantagens de preço</h3>
        <div className="mt-4 flex h-[140px] items-center justify-center text-xs text-ink-600">
          Nenhum produto em desvantagem relevante 🎉
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white p-3 shadow-card">
      <h3 className="font-display text-xs font-semibold text-ink-950">Maiores desvantagens de preço</h3>
      <p className="mt-0.5 text-[11px] text-ink-600">% de diferença Martins x mercado (negativo = mais caro)</p>
      <div className="mt-2" style={{ height: trimmed.length * 34 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trimmed} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }} barCategoryGap={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 9 }} height={20} />
            <YAxis
              type="category"
              dataKey="description"
              width={90}
              tick={{ fontSize: 9 }}
              interval={0}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(v: number) => [`${v}%`, "Diferença"]} labelFormatter={(_, payload) => (payload && payload[0] ? payload[0].payload.ean : "")} />
            <Bar dataKey="diffPct" radius={[0, 3, 3, 0]} barSize={11}>
              {trimmed.map((d, i) => (
                <Cell key={i} fill={d.diffPct < 0 ? "#DC2626" : "#D97706"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
