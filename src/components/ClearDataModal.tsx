"use client";

import { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCleared: () => void;
}

export function ClearDataModal({ open, onClose, onCleared }: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleConfirm() {
    setLoading(true);
    try {
      await fetch("/api/clear", { method: "POST" });
      onCleared();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#1F2937]">Limpar todos os dados?</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-bad-bg p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-bad" />
          <p className="text-[13px] leading-relaxed text-bad">
            Isso apaga completamente os produtos, concorrentes, CADGER, historico de envios e indicadores. Essa
            acao nao pode ser desfeita. Voce precisara enviar as planilhas novamente do zero.
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-line py-2 text-[13px] font-medium text-ink-700 hover:bg-surface"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bad py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            <Trash2 size={14} />
            {loading ? "Limpando..." : "Sim, limpar tudo"}
          </button>
        </div>
      </div>
    </div>
  );
}
