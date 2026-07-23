"use client";

import { useMemo, useState } from "react";
import { X, Copy, Check, Mail, MessageCircle } from "lucide-react";
import { DisadvantageItem } from "./Charts";
import { buildVendasMessage } from "@/lib/vendasMessageBuilder";

interface Props {
  open: boolean;
  onClose: () => void;
  items: DisadvantageItem[];
}

export function SalesMessageModal({ open, onClose, items }: Props) {
  const [copied, setCopied] = useState(false);
  const message = useMemo(function () { return buildVendasMessage(items); }, [items]);

  if (!open) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(message.body);
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 2000);
  }

  function handleOpenEmail() {
    const href = "mailto:?subject=" + encodeURIComponent(message.subject) + "&body=" + encodeURIComponent(message.body);
    window.location.href = href;
  }

  function handleOpenWhatsApp() {
    const href = "https://wa.me/?text=" + encodeURIComponent(message.body);
    window.open(href, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#1F2937]">Mensagem para o Time de Vendas</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <label className="mt-3 block text-[10px] font-medium text-[#94A3B8]">Mensagem</label>
        <textarea
          readOnly
          value={message.body}
          rows={14}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[11px] leading-relaxed text-[#1F2937]"
        />

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-[11px] font-medium text-ink-700 hover:bg-surface"
          >
            {copied ? <Check size={14} className="text-good" /> : <Copy size={14} />}
            {copied ? "Copiado!" : "Copiar texto"}
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-good py-2 text-[11px] font-semibold text-white hover:opacity-90"
          >
            <MessageCircle size={14} />
            WhatsApp
          </button>
          <button
            onClick={handleOpenEmail}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-[11px] font-semibold text-white hover:bg-accent-dark"
          >
            <Mail size={14} />
            E-mail
          </button>
        </div>
      </div>
    </div>
  );
}
