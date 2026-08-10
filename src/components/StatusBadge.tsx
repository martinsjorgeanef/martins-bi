import { CompetitivenessStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/calculations";
import { clsx } from "clsx";

const STYLES: Record<CompetitivenessStatus | "SEM_DADOS" | "NAO_CADASTRADO_MARTINS", string> = {
  COMPETITIVO: "bg-good-bg text-good border-good/20",
  ATENCAO: "bg-warn-bg text-warn border-warn/20",
  DESVANTAGEM: "bg-bad-bg text-bad border-bad/20",
  SEM_DADOS: "bg-ink-800/5 text-ink-600 border-ink-600/10",
  NAO_CADASTRADO_MARTINS: "bg-purple-100 text-purple-700 border-purple-300"
};

const DOT: Record<CompetitivenessStatus | "SEM_DADOS" | "NAO_CADASTRADO_MARTINS", string> = {
  COMPETITIVO: "bg-good",
  ATENCAO: "bg-warn",
  DESVANTAGEM: "bg-bad",
  SEM_DADOS: "bg-ink-500",
  NAO_CADASTRADO_MARTINS: "bg-purple-500"
};

export function StatusBadge({ status }: { status: CompetitivenessStatus | "SEM_DADOS" | "NAO_CADASTRADO_MARTINS" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap",
        STYLES[status]
      )}
    >
      <span className={clsx("h-1 w-1 rounded-full", DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}
