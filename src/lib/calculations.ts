import { CompetitivenessStatus } from "./types";

export function calcDiffPct(martinsPrice: number, marketPrice: number): number {
  if (marketPrice === 0) return 0;
  return (marketPrice - martinsPrice) / marketPrice;
}

export function calcStatus(diffPct: number, thresholdPct: number): CompetitivenessStatus {
  if (diffPct < 0) return "DESVANTAGEM";
  if (diffPct < thresholdPct) return "ATENCAO";
  return "COMPETITIVO";
}

export function priorityForCompetitivePct(pct: number): "Alta" | "Média" | "Baixa" {
  if (pct < 70) return "Alta";
  if (pct < 85) return "Média";
  return "Baixa";
}

export const STATUS_LABEL: Record<CompetitivenessStatus | "SEM_DADOS", string> = {
  COMPETITIVO: "Competitivo",
  ATENCAO: "Negociação pontual",
  DESVANTAGEM: "Desvantagem",
  SEM_DADOS: "Sem dados de mercado"
};
