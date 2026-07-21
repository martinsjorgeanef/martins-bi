"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { X, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadType = "MARTINS" | "COMPETITOR" | "CADGER";

interface CadgerRow {
  ean: string;
  fornecedor: string;
  description: string | null;
}

function normalizeEan(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.round(value).toString();
  }
  const cleaned = String(value).trim().replace(/\D/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

function parseCadgerClientSide(buffer: ArrayBuffer): { rows: CadgerRow[]; totalRows: number; skipped: number } {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, range: 3 });

  const rows: CadgerRow[] = [];
  let skipped = 0;

  for (const line of raw) {
    const ean = normalizeEan(line["CB-UND.Consumo"]);
    const fornecedorRaw = line["Fornecedor"];
    const fornecedor = typeof fornecedorRaw === "string" ? fornecedorRaw.trim() : "";
    const descRaw = line["Descrição Alongada"];

    if (!ean || !fornecedor) {
      skipped++;
      continue;
    }

    rows.push({
      ean,
      fornecedor,
      description: typeof descRaw === "string" && descRaw.trim() ? descRaw.trim() : null
    });
  }

  return { rows, totalRows: raw.length, skipped };
}

async function sendBatchWithRetry(payload: unknown, attempts = 3): Promise<void> {
  let lastError = "Erro desconhecido ao enviar o lote.";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch("/api/upload/cadger-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) return;
      const data = await res.json().catch(() => ({}));
      lastError = data.error || `Falha no lote (tentativa ${attempt}).`;
    } catch {
      lastError = `Falha de conexão no lote (tentativa ${attempt}).`;
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error(lastError);
}

export function UploadPanel({ open, onClose, onSuccess }: Props) {
  const [type, setType] = useState<UploadType>("MARTINS");
  const [sourceName, setSourceName] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [fornecedorOptions, setFornecedorOptions] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (open && type === "COMPETITOR" && fornecedorOptions.length === 0) {
      fetch("/api/fornecedores")
        .then((r) => r.json())
        .then((d) => setFornecedorOptions(d.fornecedores || []))
        .catch(() => {});
    }
  }, [open, type, fornecedorOptions.length]);

  if (!open) return null;

  async function handleSubmitCadger() {
    setProgress("Lendo a planilha...");
    const buffer = await file!.arrayBuffer();
    const { rows, totalRows, skipped } = parseCadgerClientSide(buffer);

    const BATCH = 400;
    const totalBatches = Math.max(1, Math.ceil(rows.length / BATCH));

    for (let i = 0; i < totalBatches; i++) {
      const batchRows = rows.slice(i * BATCH, (i + 1) * BATCH);
      setProgress(`Enviando lote ${i + 1} de ${totalBatches}...`);

      await sendBatchWithRetry({
        rows: batchRows,
        isFirstBatch: i === 0,
        isLastBatch: i === totalBatches - 1,
        fileName: file!.name,
        totalRows,
        totalSkipped: skipped
      });
    }

    setResult({
      ok: true,
      message: `Processado: ${totalRows} linhas · ${rows.length} cadastrados · ${skipped} ignorados.`
    });
    setFile(null);
    onSuccess();
  }

  async function handleSubmitDefault() {
    const formData = new FormData();
    formData.append("file", file!);
    formData.append("type", type);
    if (type === "COMPETITOR") {
      formData.append("sourceName", sourceName.trim());
      formData.append("fornecedor", fornecedor.trim());
    }

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao processar o arquivo.");
    }

    setResult({
      ok: true,
      message: `Processado: ${data.processed} linhas · ${data.created} novos · ${data.updated} atualizados · ${data.skipped} ignorados.`
    });
    setFile(null);
    onSuccess();
  }

  async function handleSubmit() {
    if (!file) {
      setResult({ ok: false, message: "Selecione um arquivo .xlsx antes de enviar." });
      return;
    }
    if (type === "COMPETITOR" && !sourceName.trim()) {
      setResult({ ok: false, message: "Informe o nome do distribuidor concorrente (ex: DPC)." });
      return;
    }
    if (type === "COMPETITOR" && !fornecedor.trim()) {
      setResult({ ok: false, message: "Informe a indústria/fornecedor desse lote (ex: COLGATE-PALMOLIVE)." });
      return;
    }

    setSubmitting(true);
    setResult(null);
    setProgress(null);

    try {
      if (type === "CADGER") {
        await handleSubmitCadger();
      } else {
        await handleSubmitDefault();
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Falha ao enviar o arquivo." });
    } finally {
      setSubmitting(false);
      setProgress(null);
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
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs font-medium text-ink-600">Nome do distribuidor</label>
              <input
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Ex: DPC"
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600">Indústria / Fornecedor desse lote</label>
              <input
                list="fornecedor-options"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: COLGATE-PALMOLIVE COM.HIG ORAL"
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <datalist id="fornecedor-options">
                {fornecedorOptions.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
              <p className="mt-1 text-[11px] text-ink-500">
                Use o mesmo nome do fornecedor que aparece no CADGER, para o cruzamento funcionar certinho.
              </p>
            </div>
          </div>
        )}

        {type === "CADGER" && (
          <p className="mt-3 rounded-lg bg-warn-bg px-3 py-2 text-xs text-warn">
            Esse envio substitui todo o cadastro anterior do CADGER (é um cadastro mensal, não acumula). Pode levar
            alguns minutos para arquivos grandes.
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

        {progress && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/10 p-3 text-sm text-accent-dark">
            <Loader2 size={16} className="animate-spin" />
            <span>{progress}</span>
          </div>
        )}

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
