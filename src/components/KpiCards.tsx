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
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium uppercase tracking-wide text-ink-500">{label}</span>
        <div className={`rounded-lg p-1.5 ${accent}`}>{icon}</div>
      </div>
      <div className="mt-2 text-[22px] font-bold tabular-nums text-ink-950">{value}</div>
      {sub && <div className="mt-0.5 text-[12px] text-ink-500">{sub}</div>}
    </div>
  );
}

export function KpiCards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[86px] animate-pulse rounded-xl bg-white shadow-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        icon={<Package size={14} className="text-accent" />}
        label="Monitorados"
        value={stats.matchedProducts.toLocaleString("pt-BR")}
        sub="Itens com comparação ativa"
        accent="bg-accent/10"
      />
      <Card
        icon={<TrendingUp size={14} className="text-good" />}
        label="Competitivos"
        value={stats.competitive.toLocaleString("pt-BR")}
        sub={stats.matchedProducts > 0 ? `${((stats.competitive / stats.matchedProducts) * 100).toFixed(0)}%` : undefined}
        accent="bg-good-bg"
      />
      <Card
        icon={<AlertTriangle size={14} className="text-warn" />}
        label="Negociação pontual"
        value={stats.attention.toLocaleString("pt-BR")}
        sub="Vantagem abaixo do limite"
        accent="bg-warn-bg"
      />
      <Card
        icon={<TrendingDown size={14} className="text-bad" />}
        label="Em desvantagem"
        value={stats.disadvantage.toLocaleString("pt-BR")}
        sub="Martins mais caro"
        accent="bg-bad-bg"
      />
    </div>
  );
}
