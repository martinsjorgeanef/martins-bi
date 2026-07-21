export type CompetitivenessStatus = "COMPETITIVO" | "ATENCAO" | "DESVANTAGEM";

export interface ProductRow {
  id: string;
  ean: string;
  description: string;
  category: string | null;
  supplier: string | null;
  martinsPrice: number;
  marketPrice: number | null;
  bestCompetitor: string | null;
  diffPct: number | null;
  status: CompetitivenessStatus | "SEM_DADOS";
  competitors: { name: string; price: number }[];
  martinsUpdatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  matchedProducts: number;
  competitive: number;
  attention: number;
  disadvantage: number;
  avgDiffPct: number | null;
  categories: string[];
  competitorNames: string[];
  supplierNames: string[];
}

export interface IndustryRow {
  fornecedor: string;
  cadastrados: number;
  itensMartins: number;
  itensConcorrenteCadastrados: number;
  itensConcorrenteComPreco: number;
  diferenca: number;
  ruptura: number;
}
