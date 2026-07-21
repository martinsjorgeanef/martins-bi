import { DashboardStats } from "@/lib/types";
import { TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react";

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
}

function Card({
  icon,
  label,
  value,
  sub,
  accent
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-600">{label}</span>
        <div className={`rounded-lg p-1.5 ${accent}`}>{icon}</div>
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-ink-950 tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-600">{sub}</div>}
    </div>
  );
}

export function KpiCards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-xl border border-line bg-white" />
        ))}
      </div>
    );
  }

  const pctMatched = stats.totalProducts > 0 ? (stats.matchedProducts / stats.totalProducts) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        icon={<Package size={16} className="text-accent" />}
        label="Produtos monitorados"
        value={stats.totalProducts.toLocaleString("pt-BR")}
        sub={`${stats.matchedProducts.toLocaleString("pt-BR")} com dados de mercado (${pctMatched.toFixed(0)}%)`}
        accent="bg-accent/10"
      />
      <Card
        icon={<TrendingUp size={16} className="text-good" />}
        label="Competitivos"
        value={stats.competitive.toLocaleString("pt-BR")}
        sub={stats.matchedProducts > 0 ? `${((stats.competitive / stats.matchedProducts) * 100).toFixed(0)}% do comparável` : undefined}
        accent="bg-good-bg"
      />
      <Card
        icon={<AlertTriangle size={16} className="text-warn" />}
        label="Negociação pontual"
        value={stats.attention.toLocaleString("pt-BR")}
        sub="Vantagem abaixo do limite"
        accent="bg-warn-bg"
      />
      <Card
        icon={<TrendingDown size={16} className="text-bad" />}
        label="Em desvantagem"
        value={stats.disadvantage.toLocaleString("pt-BR")}
        sub="Martins mais caro que o mercado"
        accent="bg-bad-bg"
      />
    </div>
  );
}
