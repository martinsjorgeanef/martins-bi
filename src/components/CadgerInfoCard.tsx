"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";

export function CadgerInfoCard() {
  const [count, setCount] = useState<number | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(function () {
    fetch("/api/cadger-info")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setCount(data.count);
        setLastUpdatedAt(data.lastUpdatedAt);
      });
  }, []);

  if (count === null || count === 0) return null;

  var dateObj = lastUpdatedAt ? new Date(lastUpdatedAt) : null;
  var dateLabel = dateObj ? dateObj.toLocaleDateString("pt-BR") : "-";
  var versionLabel = dateObj
    ? dateObj.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "-";
  var versionCapitalized = versionLabel.charAt(0).toUpperCase() + versionLabel.slice(1);

  return (
    <div className="rounded-xl bg-white p-3 shadow-card">
      <div className="flex items-center gap-2">
        <Database size={14} className="text-accent" />
        <span className="text-[13px] font-semibold text-[#1F2937]">CADGER</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
        <span className="text-[#6B7280]">
          Ultima atualizacao: <strong className="text-[#1F2937]">{dateLabel}</strong>
        </span>
        <span className="text-[#6B7280]">
          Versao: <strong className="text-[#1F2937]">{versionCapitalized}</strong>
        </span>
        <span className="text-[#6B7280]">
          Qtd. produtos: <strong className="text-[#1F2937]">{count.toLocaleString("pt-BR")}</strong>
        </span>
      </div>
    </div>
  );
}
