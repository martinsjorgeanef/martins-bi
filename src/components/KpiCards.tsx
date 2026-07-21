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
    <div className="rounded-lg border border-line bg-white p-3 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-600">{label}</span>
        <div className={`rounded-md p-1 ${accent}`}>{icon}</div>
      </div>
      <div className="mt-1 font-display text-lg font-semibold text-ink-950 tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-ink-600">{sub}</div>}
    </div>
  );
}

export function KpiCards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-lg border border-line bg-white" />
        ))}
      </div>
    );
  }

  const pctMatched = stats.totalProducts > 0 ? (stats.matchedProducts / stats.totalProducts) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <Card
        icon={<Package size={13} className="text-accent" />}
        label="Produtos monitorados"
        value={stats.totalProducts.toLocaleString("pt-BR")}
        sub={`${stats.matchedProducts.toLocaleString("pt-BR")} com dados (${pctMatched.toFixed(0)}%)`}
        accent="bg-accent/10"
      />
      <Card
        icon={<TrendingUp size={13} className="text-good" />}
        label="Competitivos"
        value={stats.competitive.toLocaleString("pt-BR")}
        sub={stats.matchedProducts > 0 ? `${((stats.competitive / stats.matchedProducts) * 100).toFixed(0)}% do comparável` : undefined}
        accent="bg-good-bg"
      />
      <Card
        icon={<AlertTriangle size={13} className="text-warn" />}
        label="Negociação pontual"
        value={stats.attention.toLocaleString("pt-BR")}
        sub="Vantagem abaixo do limite"
        accent="bg-warn-bg"
      />
      <Card
        icon={<TrendingDown size={13} className="text-bad" />}
        label="Em desvantagem"
        value={stats.disadvantage.toLocaleString("pt-BR")}
        sub="Martins mais caro"
        accent="bg-bad-bg"
      />
    </div>
  );
}
