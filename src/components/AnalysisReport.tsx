"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { IndustryRow, CategoryRow } from "@/lib/types";
import { CategoryAnalysis } from "./CategoryAnalysis";
import { IndustryAnalysis } from "./IndustryAnalysis";
import { EmailComprasModal } from "./EmailComprasModal";

interface StatsData {
  totalProducts: number;
  matchedProducts: number;
  competitive: number;
  attention: number;
  disadvantage: number;
  thresholdPct: number;
}

export function AnalysisReport() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/industries").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json())
    ]).then(([s, i, c]) => {
      setStats(s);
      setIndustries(i.industries || []);
      setCategories(c.categories || []);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-[13px] text-ink-600">Carregando análise...</p>
      </div>
    );
  }

  const pctCompetitive = stats.matchedProducts > 0 ?
