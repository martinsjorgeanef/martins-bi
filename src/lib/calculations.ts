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

export type PriorityLevel = "Prioridade Maxima" | "Alta" | "Media" | "Baixa";

export function priorityForCompetitivePct(pct: number): PriorityLevel {
  if (pct < 50) return "Prioridade Maxima";
  if (pct < 70) return "Alta";
  if (pct < 85) return "Media";
  return "Baixa";
}

export function calcRequiredDiscountPct(martinsPrice: number, marketPrice: number, thresholdFraction: number): number {
  if (martinsPrice <= 0) return 0;
  var requiredNewPrice = marketPrice * (1 - thresholdFraction);
  var discount = 1 - requiredNewPrice / martinsPrice;
  return discount > 0 ? discount : 0;
}

export function discountTier(discountFraction: number): "green" | "yellow" | "red" {
  var pct = discountFraction * 100;
  if (pct <= 2) return "green";
  if (pct <= 5) return "yellow";
  return "red";
}

export const STATUS_LABEL: Record<CompetitivenessStatus | "SEM_DADOS" | "NAO_CADASTRADO_MARTINS", string> = {
  COMPETITIVO: "Competitivo",
  ATENCAO: "Negociacao pontual",
  DESVANTAGEM: "Desvantagem",
  SEM_DADOS: "Sem dados de mercado",
  NAO_CADASTRADO_MARTINS: "Nao Cadastrado Martins"
};
