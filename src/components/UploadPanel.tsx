"use client";

import { useState } from "react";
import { X, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadType = "MARTINS" | "COMPETITOR" | "CADGER";

export function UploadPanel({ open, onClose, onSuccess }: Props) {
  const [type, setType] = useState<UploadType>("MARTINS");
  const [sourceName, setSourceName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!file) {
      setResult({ ok: false, message: "Selecione um arquivo .xlsx antes de enviar." });
      return;
    }
    if (type === "COMPETITOR" && !sourceName.trim()) {
      setResult({ ok: false, message: "Informe o nome do distribuidor concorrente (ex: DPC)." });
      return;
    }

    setSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (type === "COMPETITOR") formData.append("sourceName", sourceName.trim());

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setResult({ ok: false, message: data.error || "Erro ao processar o arquivo." });
      } else {
        setResult({
          ok: true,
          message: `Processado: ${data.processed} linhas · ${data.created} novos · ${data.updated} atualizados · ${data.skipped} ignorados.`
        });
        setFile(null);
        onSuccess();
      }
    } catch {
      setResult({ ok: false, message: "Falha de conexão ao enviar o arquivo." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink-950">Enviar planilha</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex gap-1 rounded-lg bg-surface p-1">
          <button
            onClick={() => setType("MARTINS")}
            className={clsx(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition sm:text-sm",
              type === "MARTINS" ? "bg-white text-ink-950 shadow-card" : "text-ink-600"
            )}
          >
            Preços Martins
          </button>
          <button
            onClick={() => setType("COMPETITOR")}
            className={clsx(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition sm:text-sm",
              type === "COMPETITOR" ? "bg-white text-ink-950 shadow-card" : "text-ink-600"
            )}
          >
            Concorrente
          </button>
          <button
            onClick={() => setType("CADGER")}
            className={clsx(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition sm:text-sm",
              type === "CADGER" ? "bg-white text-ink-950 shadow-card" : "text-ink-600"
            )}
          >
            CADGER
          </button>
        </div>

        {type === "COMPETITOR" && (
          <div className="mt-3">
            <label className="text-xs font-medium text-ink-600">Nome do distribuidor</label>
            <input
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="Ex: DPC"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        )}

        {type === "CADGER" && (
          <p className="mt-3 rounded-lg bg-warn-bg px-3 py-2 text-xs text-warn">
            Esse envio substitui todo o cadastro anterior do CADGER (é um cadastro mensal, não acumula).
          </p>
        )}

        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface px-4 py-8 text-center hover:border-accent">
          <UploadCloud size={22} className="text-accent" />
          <span className="text-sm text-ink-700">
            {file ? file.name : "Clique para selecionar o arquivo .xlsx"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {result && (
          <div
            className={clsx(
              "mt-3 flex items-start gap-2 rounded-lg p-3 text-sm",
              result.ok ? "bg-good-bg text-good" : "bg-bad-bg text-bad"
            )}
          >
            {result.ok ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            )}
            <span>{result.message}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Processando..." : "Enviar e atualizar dados"}
        </button>
      </div>
    </div>
  );
}
