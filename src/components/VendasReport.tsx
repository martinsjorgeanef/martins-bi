"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { DisadvantageItem } from "./Charts";
import { SalesMessageModal } from "./SalesMessageModal";
import { buildVendasMessage } from "@/lib/vendasMessageBuilder";
import { VendasMode } from "@/lib/vendasGrouping";

function renderPreviewLine(line: string, idx: number) {
  var parts = line.split(/(\*[^*]+\*)/g);
  return (
    <div key={idx} className="whitespace-pre-wrap">
      {parts.map(function (part, i) {
        if (part.length > 1 && part.charAt(0) === "*" && part.charAt(part.length - 1) === "*") {
          return (
            <strong key={i} className="font-bold text-good">
              {part.slice(1, -1)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

export function VendasReport() {
  const [allItems, setAllItems] = useState<DisadvantageItem[]>([]);
  const [industryName, setIndustryName] = useState<string | null>(null);
  const [notaLabel, setNotaLabel] = useState("Nota RJ");
  const [prazoLabel, setPrazoLabel] = useState("Prazo 45D");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [mode, setMode] = useState<VendasMode>("resumida");

  const loadAll = useCallback(function () {
    setLoading(true);
    setLoadError(false);
    fetch("/api/settings")
      .then(function (r) { return r.json(); })
      .then(function (settingsData) {
        var activeCompetitors = settingsData.activeCompetitors || "";
        setNotaLabel(settingsData.notaLabel || "Nota RJ");
        setPrazoLabel(settingsData.prazoLabel || "Prazo 45D");
        var params = new URLSearchParams({ competitors: activeCompetitors });
        return Promise.all([
          fetch("/api/stats?" + params.toString()).then(function (r) {
            if (!r.ok) throw new Error("Falha ao carregar estatisticas.");
            return r.json();
          }),
          fetch("/api/industries").then(function (r) {
            if (!r.ok) throw new Error("Falha ao carregar industrias.");
            return r.json();
          })
        ]);
      })
      .then(function (results) {
        var stats = results[0];
        var ind = results[1];
        setAllItems(stats.allItems || []);
        var industries = ind.industries || [];
        setIndustryName(industries.length > 0 ? industries[0].fornecedor : null);
      })
      .catch(function () {
        setLoadError(true);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  useEffect(function () { loadAll(); }, [loadAll]);

  var competitiveItems = useMemo(
    function () { return allItems.filter(function (i) { return i.status === "COMPETITIVO"; }); },
    [allItems]
  );

  var items = mode === "resumida" ? competitiveItems : allItems;

  var message = useMemo(
    function () { return buildVendasMessage(items, industryName, mode); },
    [items, industryName, mode]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-[13px] text-ink-600">Carregando...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div><p className="text-[13px] text-bad">Nao foi possivel carregar a Central de Comunicacao para Vendas.</p><button onClick={loadAll} className="mt-2 rounded-lg border border-line px-3 py-1.5 text-[13px]">Tentar novamente</button></div>
      </div>
    );
  }

  var lines = message.body.split("\n");

  return (
    <div className="mx-auto flex max-w-[720px] w-[95%] flex-col gap-4 py-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#1F2937]">Central de Comunicacao para Vendas</h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Preview da mensagem que sera enviada ao time comercial
          {industryName ? " - Industria: " + industryName : ""}.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={function () { setMode("resumida"); }}
          className={
            "flex-1 rounded-lg border py-2 text-[13px] font-semibold " +
            (mode === "resumida" ? "border-accent bg-accent/10 text-accent-dark" : "border-line bg-white text-ink-600")
          }
        >
          Mensagem Resumida (WhatsApp)
        </button>
        <button
          onClick={function () { setMode("completo"); }}
          className={
            "flex-1 rounded-lg border py-2 text-[13px] font-semibold " +
            (mode === "completo" ? "border-accent bg-accent/10 text-accent-dark" : "border-line bg-white text-ink-600")
          }
        >
          Catalogo Completo
        </button>
      </div>

      <div className="rounded-2xl bg-[#DCF8C6] p-4 shadow-card">
        <div className="rounded-xl bg-white p-4">
          <div className="flex flex-col gap-0.5 font-mono text-[12px] leading-relaxed text-[#1F2937]">
            {items.length === 0 ? (
              <p className="text-[13px] text-ink-600">Nenhuma oportunidade identificada no momento.</p>
            ) : (
              lines.map(function (line, idx) { return renderPreviewLine(line, idx); })
            )}
          </div>
        </div>
      </div>

      <button
        onClick={function () { setMessageOpen(true); }}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-good py-3 text-[14px] font-bold text-white hover:opacity-90"
      >
        <MessageCircle size={16} />
        Gerar e Enviar Mensagem
      </button>

      <SalesMessageModal
        open={messageOpen}
        onClose={function () { setMessageOpen(false); }}
        competitiveItems={competitiveItems}
        allItems={allItems}
        industryName={industryName}
        initialMode={mode}
        notaLabel={notaLabel}
        prazoLabel={prazoLabel}
      />
    </div>
  );
}
