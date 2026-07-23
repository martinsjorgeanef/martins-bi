"use client";

import { useState } from "react";
import { Target, ChevronRight } from "lucide-react";
import { RecoveryItemsModal } from "./RecoveryItemsModal";

export interface RecoveryPotential {
  avgDiscountPct: number;
  itemsRecoverable: number;
  oldCompetitivePct: number;
  newCompetitivePct: number;
  green: number;
  yellow: number;
  red: number;
}

export function RecoveryPotentialCard({ recovery }: { recovery: RecoveryPotential | null }) {
  const [open, setOpen] = useState(false);

  if (!recovery || recovery.itemsRecoverable === 0) return null;

  var avgLabel = recovery.avgDiscountPct.toString().replace(".", ",");

  return (
    <>
      <button
        onClick={function () { setOpen(true); }}
        className="w-full rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-transparent p-4 text-left shadow-card transition hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target size={15} className="text-accent" />
            <span className="text-[16px] font-semibold text-[#1F2937]">Potencial de Recuperação</span>
          </div>
          <ChevronRight size={15} className="text-accent" />
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-[#374151]">
          Com um desconto médio de <strong className="text-accent-dark">{avgLabel}%</strong>, a Martins recupera{" "}
          <strong className="text-accent-dark">{recovery.itemsRecoverable} itens</strong> e eleva a competitividade de{" "}
          <strong>{recovery.oldCompetitivePct}%</strong> para{" "}
          <strong className="text-good">{recovery.newCompetitivePct}%</strong>.
        </p>
        <div className="mt-3 flex gap-3 text-[11px] text-[#6B7280]">
          <span>🟢 {recovery.green} até 2%</span>
          <span>🟡 {recovery.yellow} entre 2% e 5%</span>
          <span>🔴 {recovery.red} acima de 5%</span>
        </div>
      </button>

      <RecoveryItemsModal open={open} onClose={function () { setOpen(false); }} />
    </>
  );
}
