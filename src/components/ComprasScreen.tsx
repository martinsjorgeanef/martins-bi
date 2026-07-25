"use client";

import { useEffect, useState, useCallback } from "react";
import { PriorityVendorCard } from "./PriorityVendorCard";
import { OpportunitiesInsights } from "./OpportunitiesInsights";
import { PriorityActions } from "./PriorityActions";
import { CategoryTable } from "./CategoryTable";
import { EmailComprasModal } from "./EmailComprasModal";
import { IndustryRow, CategoryRow } from "@/lib/types";
import { FileText, FileSpreadsheet, Mail } from "lucide-react";
import { Button } from "./ui/Button";
import { exportComprasExcel } from "@/lib/comprasExcelExport";
import { exportComprasPdf } from "@/lib/comprasPdfExport";

export function ComprasScreen() {
  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [competitive, setCompetitive] = useState(0);
  const [disadvantage, setDisadvantage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);

  const loadAll = useCallback(async function () {
    setLoading(true);
    const settingsRes = await fetch("/api/settings");
    const settingsData = await settingsRes.json();
    const activeCompetitors = settingsData.activeCompetitors || "";
    const params = new URLSearchParams({ competitors: activeCompetitors });

    const statsRes = await fetch("/api/stats?" + params.toString());
    const industriesRes = await fetch("/api/industries");
    const categoriesRes = await fetch("/api/categories");

    const statsData = await statsRes.json();
    const industriesData = await industriesRes.json();
    const categoriesData = await categoriesRes.json();

    setCompetitive(statsData.competitive || 0);
    setDisadvantage(statsData.disadvantage || 0);
    setIndustries(industriesData.industries || []);
    setCategories(categoriesData.categories || []);
    setLoading(false);
  }, []);

  useEffect(function () { loadAll(); }, [loadAll]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-[13px] text-ink-600">Carregando...</p>
      </div>
    );
  }

  var industriaAtiva = industries[0];

  return (
    <div className="mx-auto flex max-w-[1000px] w-[95%] flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1F2937]">Analise para Compradores</h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">Posicionamento, prioridades e sugestoes de negociacao</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={function () { void exportComprasExcel(industriaAtiva, categories); }}>
            <FileSpreadsheet size={14} />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={function () { void exportComprasPdf(industriaAtiva, categories); }}>
            <FileText size={14} />
            Exportar PDF
          </Button>
          <Button variant="secondary" onClick={function () { setEmailOpen(true); }}>
            <Mail size={14} />
            Gerar E-mail
          </Button>
        </div>
      </div>

      <PriorityVendorCard industry={industriaAtiva} />
      <OpportunitiesInsights categories={categories} />
      <PriorityActions
        competitive={competitive}
        disadvantage={disadvantage}
        industry={industriaAtiva}
        categories={categories}
      />
      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[13px] font-semibold text-[#1F2937]">Categorias criticas</h3>
        <div className="mt-3">
          <CategoryTable categories={categories} />
        </div>
      </div>

      <EmailComprasModal
        open={emailOpen}
        onClose={function () { setEmailOpen(false); }}
        categories={categories}
        industry={industriaAtiva}
      />
    </div>
  );
}
