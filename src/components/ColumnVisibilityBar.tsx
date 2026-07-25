"use client";

import { Eye, EyeOff, Save } from "lucide-react";
import { ColumnVisibility } from "./ProductsTable";
import { Chip } from "./ui/Chip";
import { Button } from "./ui/Button";

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
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white p-2.5 shadow-card">
      {CHIP_ORDER.map(function (c) {
        return (
          <Chip key={c.key} active={visibleColumns[c.key]} onClick={function () { toggle(c.key); }}>
            {c.label}
          </Chip>
        );
      })}

      <div className="mx-1 h-6 w-px bg-line" />

      <Button variant="outline" onClick={showAll} className="rounded-full">
        <Eye size={13} />
        Mostrar tudo
      </Button>
      <Button variant="outline" onClick={hideAll} className="rounded-full">
        <EyeOff size={13} />
        Ocultar tudo
      </Button>
      <Button
        variant="ghost"
        onClick={saveView}
        className="rounded-full border border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20"
      >
        <Save size={13} />
        Salvar visualizacao
      </Button>
    </div>
  );
}
