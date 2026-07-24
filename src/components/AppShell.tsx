"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Users, Briefcase, Megaphone, History, Settings, BarChart3 } from "lucide-react";

var NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos", label: "Analise Produtos", icon: Search },
  { href: "/compras", label: "Analise para Compradores", icon: Briefcase },
  { href: "/vendas", label: "Vendas", icon: Megaphone },
  { href: "/concorrentes", label: "Concorrentes", icon: Users },
  { href: "/historico", label: "Historico", icon: History },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-line bg-ink-950">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-semibold leading-tight text-white">Competitividade</div>
            <div className="text-[9px] leading-tight text-white/50">Martins</div>
          </div>
        </div>
        <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-2">
          {NAV_ITEMS.map(function (item) {
            var Icon = item.icon;
            var active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition " +
                  (active ? "bg-accent text-white" : "text-white/70 hover:bg-white/10 hover:text-white")
                }
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
