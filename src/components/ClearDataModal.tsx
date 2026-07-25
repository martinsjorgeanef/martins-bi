"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onCleared: () => void;
}

export function ClearDataModal({ open, onClose, onCleared }: Props) {
  const [loading, setLoading] = useState(false);

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
    <Modal open={open} onClose={onClose} title="Limpar dados da analise?">
      <div className="flex items-start gap-2 rounded-lg bg-bad-bg p-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-bad" />
        <p className="text-[13px] leading-relaxed text-bad">
          Isso apaga produtos Martins, concorrentes, comparacoes, indicadores e mensagens geradas. O CADGER (base de
          fornecedores) e mantido, ja que ele e atualizado separadamente. Essa acao nao pode ser desfeita.
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={loading} className="flex-1 border-transparent bg-bad text-white hover:bg-bad/90">
          <Trash2 size={14} />
          {loading ? "Limpando..." : "Sim, limpar"}
        </Button>
      </div>
    </Modal>
  );
}
