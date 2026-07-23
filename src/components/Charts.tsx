"use client";

export interface DisadvantageItem {
  ean: string;
  description: string;
  category: string | null;
  diffPct: number;
}

export function TopDisadvantageChart({ data }: { data: DisadvantageItem[] }) {
  const top5 = data.slice(0, 5);

  if (top5.length === 0 || top5.every(function (d) { return d.diffPct >= 5; })) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[12px] font-semibold text-[#1F2937]">Itens Prioritarios para Negociacao</h3>
        <div className="mt-3 flex h-[70px] items-center justify-center text-[9px] text-[#94A3B8]">
          Nenhum produto em desvantagem relevante
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-[12px] font-semibold text-[#1F2937]">Itens Prioritarios para Negociacao</h3>
      <p className="mt-0.5 text-[8px] text-[#94A3B8]">Os 5 itens mais criticos</p>

      <div className="mt-2 flex flex-col">
        {top5.map(function (d) {
          return (
            <div key={d.ean} className="border-b border-line/50 py-2 last:border-b-0">
              <div className="text-[9px] font-mono text-[#94A3B8]">{d.ean}</div>
              <div className="text-[10px] font-medium text-[#1F2937]">{d.description}</div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="text-[9px] text-[#2563EB]">
                  🏷️ Categoria: {d.category ? d.category : "Sem categoria"}
                </span>
                <span className="shrink-0 text-[12px] font-bold text-[#DC2626]">Diferenca: {d.diffPct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopAdvantageChart({ data }: { data: DisadvantageItem[] }) {
  const top10 = data.slice(0, 10);

  if (top10.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[12px] font-semibold text-[#1F2937]">Maiores Vantagens Competitivas</h3>
        <div className="mt-3 flex h-[70px] items-center justify-center text-[9px] text-[#94A3B8]">
          Nenhum item com vantagem no momento
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-[12px] font-semibold text-[#1F2937]">Maiores Vantagens Competitivas</h3>
      <p className="mt-0.5 text-[8px] text-[#94A3B8]">Os 10 itens onde a Martins mais se destaca</p>

      <div className="mt-2 flex flex-col">
        {top10.map(function (d) {
          return (
            <div key={d.ean} className="border-b border-line/50 py-2 last:border-b-0">
              <div className="text-[9px] font-mono text-[#94A3B8]">{d.ean}</div>
              <div className="text-[10px] font-medium text-[#1F2937]">{d.description}</div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="text-[9px] text-[#2563EB]">
                  🏷️ Categoria: {d.category ? d.category : "Sem categoria"}
                </span>
                <span className="shrink-0 text-[12px] font-bold text-[#16A34A]">Vantagem: +{d.diffPct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
