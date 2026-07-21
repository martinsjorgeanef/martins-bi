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
