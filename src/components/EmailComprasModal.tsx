"use client";

import { useState } from "react";
import { X, Copy, Check, Mail } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  subject: string;
  body: string;
}

export function EmailComprasModal({ open, onClose, subject, body }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText("Assunto: " + subject + "\n\n" + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenEmail() {
    const mailtoHref = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    window.location.href = mailtoHref;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink-950">E-mail para Compras</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <label className="mt-3 block text-[12px] font-medium text-ink-500">Assunto</label>
        <div className="mt-1 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink-800">
          {subject}
        </div>

        <label className="mt-3 block text-[12px] font-medium text-ink-500">Corpo do e-mail</label>
        <textarea
          readOnly
          value={body}
          rows={12}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] leading-relaxed text-ink-800"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-[13px] font-medium text-ink-700 hover:bg-surface"
          >
            {copied ? <Check size={14} className="text-good" /> : <Copy size={14} />}
            {copied ? "Copiado!" : "Copiar texto"}
          </button>
          <button
            onClick={handleOpenEmail}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-[13px] font-semibold text-white hover:bg-accent-dark"
          >
            <Mail size={14} />
            Abrir no e-mail
          </button>
        </div>
      </div>
    </div>
  );
}
