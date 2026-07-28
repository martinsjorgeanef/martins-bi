"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Mail, MessageCircle } from "lucide-react";
import { DisadvantageItem } from "./Charts";
import { buildVendasMessage } from "@/lib/vendasMessageBuilder";
import { VendasMode } from "@/lib/vendasGrouping";
import { Modal } from "./ui/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  competitiveItems: DisadvantageItem[];
  allItems: DisadvantageItem[];
  industryName: string | null;
  initialMode?: VendasMode;
  notaLabel?: string;
  prazoLabel?: string;
}

export function SalesMessageModal({ open, onClose, competitiveItems, allItems, industryName, initialMode, notaLabel, prazoLabel }: Props) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<VendasMode>(initialMode || "resumida");
  const items = mode === "resumida" ? competitiveItems : allItems;
  const message = useMemo(function () {
    return buildVendasMessage(items, industryName, mode, notaLabel, prazoLabel);
  }, [items, industryName, mode, notaLabel, prazoLabel]);

  async function handleCopy() {
    await navigator.clipboard.writeText(message.body);
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 2000);
  }

  function handleOpenEmail() {
    var href = "mailto:?subject=" + encodeURIComponent(message.subject) + "&body=" + encodeURIComponent(message.body);
    window.location.href = href;
  }

  function handleOpenWhatsApp() {
    var href = "https://wa.me/?text=" + encodeURIComponent(message.body);
    window.open(href, "_blank");
  }

  return (
    <Modal open={open} onClose={onClose} title="Mensagem para o Time de Vendas" maxWidth="max-w-lg">
      <div className="flex gap-2">
        <button
          onClick={function () { setMode("resumida"); }}
          className={
            "flex-1 rounded-lg border py-1.5 text-[13px] font-semibold " +
            (mode === "resumida" ? "border-accent bg-accent/10 text-accent-dark" : "border-line text-ink-600")
          }
        >
          Mensagem Resumida (WhatsApp)
        </button>
        <button
          onClick={function () { setMode("completo"); }}
          className={
            "flex-1 rounded-lg border py-1.5 text-[13px] font-semibold " +
            (mode === "completo" ? "border-accent bg-accent/10 text-accent-dark" : "border-line text-ink-600")
          }
        >
          Catalogo Completo
        </button>
      </div>

      <label className="mt-3 block text-[12px] font-medium text-ink-500">Mensagem</label>
      <textarea
        readOnly
        value={message.body}
        rows={14}
        className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] leading-relaxed text-[#1F2937]"
      />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-[13px] font-medium text-ink-700 hover:bg-surface"
        >
          {copied ? <Check size={14} className="text-good" /> : <Copy size={14} />}
          {copied ? "Copiado!" : "Copiar"}
        </button>
        <button
          onClick={handleOpenWhatsApp}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-good py-2 text-[13px] font-semibold text-white hover:opacity-90"
        >
          <MessageCircle size={14} />
          WhatsApp
        </button>
        <button
          onClick={handleOpenEmail}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-[13px] font-semibold text-white hover:bg-accent-dark"
        >
          <Mail size={14} />
          E-mail
        </button>
      </div>
    </Modal>
  );
}
