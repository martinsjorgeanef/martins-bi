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
  accent
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-white px-3.5 py-3 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium uppercase tracking-wide text-ink-500">{label}</span>
        <div className={"rounded-md p-1 " + accent}>{icon}</div>
      </div>
      <div className="mt-1 text-[20px] font-bold tabular-nums text-ink-950">{value}</div>
    </div>
  );
}

export function KpiCards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[62px] animate-pulse rounded-xl bg-white shadow-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <Card icon={<Package size={13} className="text-accent" />} label="Monitorados" value={stats.matchedProducts.toLocaleString("pt-BR")} accent="bg-accent/10" />
      <Card icon={<TrendingUp size={13} className="text-good" />} label="Competitivos" value={stats.competitive.toLocaleString("pt-BR")} accent="bg-good-bg" />
      <Card icon={<AlertTriangle size={13} className="text-warn" />} label="Negociação" value={stats.attention.toLocaleString("pt-BR")} accent="bg-warn-bg" />
      <Card icon={<TrendingDown size={13} className="text-bad" />} label="Desvantagem" value={stats.disadvantage.toLocaleString("pt-BR")} accent="bg-bad-bg" />
    </div>
  );
}
