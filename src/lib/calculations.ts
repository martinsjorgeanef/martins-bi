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

// Calcula o desconto (fracao do preco Martins) necessario para o item deixar de estar
// em desvantagem e passar a "Competitivo" (ou seja, atingir o limite de negociacao atual).
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

export const STATUS_LABEL: Record<CompetitivenessStatus | "SEM_DADOS", string> = {
  COMPETITIVO: "Competitivo",
  ATENCAO: "Negociação pontual",
  DESVANTAGEM: "Desvantagem",
  SEM_DADOS: "Sem dados de mercado"
};
