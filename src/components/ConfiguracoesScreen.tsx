"use client";

import { useState } from "react";
import { CadgerInfoCard } from "./CadgerInfoCard";
import { UploadPanel } from "./UploadPanel";
import { ClearDataModal } from "./ClearDataModal";
import { RefreshCcw, Trash2 } from "lucide-react";

export function ConfiguracoesScreen() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  function handleUploadSuccess() {
    setUploadOpen(false);
    window.location.reload();
  }

  function handleCleared() {
    setClearOpen(false);
    window.location.reload();
  }

  return (
    <div className="mx-auto flex max-w-[700px] w-[95%] flex-col gap-4 py-6">
      <h1 className="text-[20px] font-bold text-[#1F2937]">Configuracoes</h1>

      <CadgerInfoCard />

      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[13px] font-semibold text-[#1F2937]">Base CADGER</h3>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          Atualize a base de fornecedores/industrias. A atualizacao substitui totalmente a versao anterior.
        </p>
        <button
          onClick={function () { setUploadOpen(true); }}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[12px] font-semibold text-white hover:bg-accent-dark"
        >
          <RefreshCcw size={13} />
          Atualizar CADGER
        </button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[13px] font-semibold text-[#1F2937]">Dados da analise</h3>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          Limpa produtos Martins, concorrentes e comparacoes. O CADGER e mantido.
        </p>
        <button
          onClick={function () { setClearOpen(true); }}
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-bad/40 px-3 py-2 text-[12px] font-semibold text-bad hover:bg-bad/10"
        >
          <Trash2 size={13} />
          Limpar Dados
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-line bg-white p-4">
        <h3 className="text-[13px] font-semibold text-[#1F2937]">Backup e restauracao</h3>
        <p className="mt-1 text-[12px] text-[#94A3B8]">
          Ainda nao implementado nesta versao. Requer uma funcionalidade nova de exportacao/importacao completa do
          banco de dados. Pode ser a proxima entrega.
        </p>
      </div>

      <UploadPanel open={uploadOpen} onClose={function () { setUploadOpen(false); }} onSuccess={handleUploadSuccess} />
      <ClearDataModal open={clearOpen} onClose={function () { setClearOpen(false); }} onCleared={handleCleared} />
    </div>
  );
}
