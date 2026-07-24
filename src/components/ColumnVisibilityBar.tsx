"use client";

import { useEffect } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import { ColumnVisibility } from "./ProductsTable";

interface Props {
  visibleColumns: ColumnVisibility;
  onChange: (v: ColumnVisibility) => void;
}

var STORAGE_KEY = "productAnalysisColumnVisibility";

var CHIP_ORDER: { key: keyof ColumnVisibility; label: string }[] = [
  { key: "ean", label: "EAN" },
  { key: "descricao", label: "Descricao" },
  { key: "categoria", label: "Categoria" },
  { key: "fornecedor", label: "Fornecedor" },
  { key: "distribuidor", label: "Distribuidor" },
  { key: "precoMartins", label: "Preco Martins" },
  { key: "precoConcorrente", label: "Preco Concorrente" },
  { key: "diferenca", label: "Diferenca" },
  { key: "status", label: "Status" },
  { key: "marca", label: "Marca" }
];

export function loadSavedColumnVisibility(defaults: ColumnVisibility): ColumnVisibility {
  if (typeof window === "undefined") return defaults;
  try {
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    var parsed = JSON.parse(raw);
    return Object.assign({}, defaults, parsed);
  } catch (err) {
    return defaults;
  }
}

export function ColumnVisibilityBar({ visibleColumns, onChange }: Props) {
  function toggle(key: keyof ColumnVisibility) {
    var next = Object.assign({}, visibleColumns);
    next[key] = !next[key];
    onChange(next);
  }

  function showAll() {
    var next = Object.assign({}, visibleColumns);
    CHIP_ORDER.forEach(function (c) { next[c.key] = true; });
    onChange(next);
  }

  function hideAll() {
    var next = Object.assign({}, visibleColumns);
    CHIP_ORDER.forEach(function (c) { next[c.key] = false; });
    onChange(next);
  }

  function saveView() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white p-2 shadow-card">
      {CHIP_ORDER.map(function (c) {
        var active = visibleColumns[c.key];
        return (
          <button
            key={c.key}
            onClick={function () { toggle(c.key); }}
            className={
              "h-9 rounded-full border px-3 text-[13px] font-medium transition " +
              (active
                ? "border-accent bg-accent text-white"
                : "border-line bg-white text-ink-600 hover:bg-surface")
            }
          >
            {c.label}
          </button>
        );
      })}

      <div className="mx-1 h-6 w-px bg-line" />

      <button
        onClick={showAll}
        className="flex h-9 items-center gap-1 rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink-600 hover:bg-surface"
      >
        <Eye size={13} />
        Mostrar tudo
      </button>
      <button
        onClick={hideAll}
        className="flex h-9 items-center gap-1 rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink-600 hover:bg-surface"
      >
        <EyeOff size={13} />
        Ocultar tudo
      </button>
      <button
        onClick={saveView}
        className="flex h-9 items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 text-[13px] font-semibold text-accent-dark hover:bg-accent/20"
      >
        <Save size={13} />
        Salvar visualizacao
      </button>
    </div>
  );
}
