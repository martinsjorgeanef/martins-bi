"use client";

import { useEffect, useState } from "react";
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

interface MinimalItem {
  requiredDiscountPct?: number;
}

interface Props {
  recovery: RecoveryPotential | null;
  competitive: number;
  matchedProducts: number;
}

export function RecoveryPotentialCard({ recovery, competitive, matchedProducts }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MinimalItem[]>([]);
  const [simPct, setSimPct] = useState(3);
  const [simInitialized, setSimInitialized] = useState(false);

  useEffect(function () {
    if (!recovery || recovery.itemsRecoverable === 0) return;

    if (!simInitialized) {
      setSimPct(Math.max(1, Math.ceil(recovery.avgDiscountPct)));
      setSimInitialized(true);
    }

    fetch("/api/products?status=DESVANTAGEM&pageSize=2000&sortBy=diffPct&sortDir=asc")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setItems(data.rows || []);
      });
  }, [recovery, simInitialized]);

  if (!recovery || recovery.itemsRecoverable === 0) return null;

  var avgLabel = recovery.avgDiscountPct.toString().replace(".", ",");

  var itemsBecomingCompetitive = items.filter(function (it) {
    return it.requiredDiscountPct !== undefined && it.requiredDiscountPct * 100 <= simPct;
  }).length;

  var simNewCompetitivePct =
    matchedProducts > 0 ? Math.round(((competitive + itemsBecomingCompetitive) / matchedProducts) * 1000) / 10 : 0;

  return (
    <>
      <div className="w-full rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-transparent p-4 shadow-card">
        <button onClick={function () { setOpen(true); }} className="flex w-full items-center justify-between text-left">
          <div className="flex items-center gap-1.5">
            <Target size={15} className="text-accent" />
            <span className="text-[16px] font-semibold text-[#1F2937]">Potencial de Recuperação</span>
          </div>
          <ChevronRight size={15} className="text-accent" />
        </button>

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

        <div className="mt-4 rounded-lg border border-line bg-white p-3">
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-medium text-[#374151]">Simular desconto:</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={simPct}
              onChange={function (e) { setSimPct(Number(e.target.value)); }}
              className="w-16 rounded-md border border-line px-2 py-1 text-[13px] font-semibold text-ink-950 outline-none focus:border-accent"
            />
            <span className="text-[13px] text-ink-600">%</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[#1F2937]">
            Com <strong className="text-accent-dark">{simPct}%</strong> de desconto,{" "}
            <strong className="text-good">
              {itemsBecomingCompetitive} de {items.length}
            </strong>{" "}
            itens em desvantagem passam a competitivo. Nova competitividade geral:{" "}
            <strong className="text-good">{simNewCompetitivePct}%</strong>.
          </p>
        </div>
      </div>

      <RecoveryItemsModal open={open} onClose={function () { setOpen(false); }} />
    </>
  );
}
