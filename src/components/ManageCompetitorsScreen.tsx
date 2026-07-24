"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, RefreshCcw, Plus, Check } from "lucide-react";
import { UploadPanel } from "./UploadPanel";

interface CompetitorInfo {
  competitorName: string;
  industries: string[];
  totalItems: number;
}

export function ManageCompetitorsScreen() {
  const [competitors, setCompetitors] = useState<CompetitorInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function loadCompetitors() {
    fetch("/api/competitors")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setCompetitors(data.competitors || []);
        setLoading(false);
      });
  }

  function loadSelection() {
    fetch("/api/settings")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var current = data.activeCompetitors
          ? data.activeCompetitors.split(",").filter(function (s: string) { return s.length > 0; })
          : [];
        setSelected(current);
      });
  }

  useEffect(function () {
    loadCompetitors();
    loadSelection();
  }, []);

  function toggleSelected(name: string) {
    if (selected.indexOf(name) !== -1) {
      setSelected(selected.filter(function (c) { return c !== name; }));
    } else {
      setSelected(selected.concat([name]));
    }
  }

  async function handleRemove(name: string) {
    var confirmed = window.confirm(
      "Remover o concorrente " + name + "? Isso apaga todos os precos importados dele."
    );
    if (!confirmed) return;
    await fetch("/api/competitors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competitorName: name })
    });
    loadCompetitors();
    loadSelection();
  }

  async function handleSaveAndReturn() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeCompetitors: selected.join(",") })
    });
    setSaving(false);
    window.location.href = "/";
  }

  function handleUploadSuccess() {
    setUploadOpen(false);
    loadCompetitors();
  }

  var atLimit = competitors.length >= 4;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-ink-950 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white">
            <ArrowLeft size={15} />
            Voltar ao painel
          </Link>
          <h1 className="text-[14px] font-semibold text-white">Gerenciar Concorrentes</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[13px] text-ink-600">
            Selecione ate 4 concorrentes para comparar simultaneamente. Cada concorrente tem sua propria planilha.
          </p>
          <button
            onClick={function () { setUploadOpen(true); }}
            disabled={atLimit}
            title={atLimit ? "Limite de 4 concorrentes atingido" : "Adicionar concorrente"}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[12px] font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            <Plus size={14} />
            Adicionar Concorrente
          </button>
        </div>

        {loading ? (
          <p className="text-[13px] text-ink-600">Carregando...</p>
        ) : competitors.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-card">
            <p className="text-[13px] text-ink-600">Nenhum concorrente cadastrado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {competitors.map(function (c) {
              var isSelected = selected.indexOf(c.competitorName) !== -1;
              return (
                <div key={c.competitorName} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={function () { toggleSelected(c.competitorName); }}
                      className={
                        "flex h-6 w-6 items-center justify-center rounded-md border " +
                        (isSelected ? "border-accent bg-accent text-white" : "border-line text-transparent")
                      }
                    >
                      <Check size={14} />
                    </button>
                    <div>
                      <div className="text-[14px] font-semibold text-[#1F2937]">{c.competitorName}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {c.industries.map(function (ind) {
                          return (
                            <span key={ind} className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-[#6B7280]">
                              {ind}
                            </span>
                          );
                        })}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#94A3B8]">{c.totalItems} itens importados</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={function () { setUploadOpen(true); }}
                      title="Atualizar planilha deste concorrente"
                      className="rounded-lg border border-line p-2 text-ink-700 hover:bg-surface"
                    >
                      <RefreshCcw size={14} />
                    </button>
                    <button
                      onClick={function () { handleRemove(c.competitorName); }}
                      title="Remover concorrente"
                      className="rounded-lg border border-bad/40 p-2 text-bad hover:bg-bad/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSaveAndReturn}
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-accent py-2.5 text-[13px] font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar e voltar ao Dashboard"}
        </button>
      </main>

      <UploadPanel open={uploadOpen} onClose={function () { setUploadOpen(false); }} onSuccess={handleUploadSuccess} />
    </div>
  );
}
