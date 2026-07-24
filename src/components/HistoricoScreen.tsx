"use client";

import { useEffect, useState } from "react";

interface LogItem {
  id: string;
  type: string;
  sourceName: string | null;
  fileName: string;
  rowsProcessed: number;
  rowsCreated: number;
  rowsUpdated: number;
  rowsSkipped: number;
  createdAt: string;
}

function typeLabel(type: string): string {
  if (type === "MARTINS") return "Precos Martins";
  if (type === "COMPETITOR") return "Concorrente";
  if (type === "CADGER") return "CADGER";
  return type;
}

export function HistoricoScreen() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    fetch("/api/upload")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setLogs(data.logs || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto flex max-w-[900px] w-[95%] flex-col gap-4 py-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#1F2937]">Historico</h1>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          Registro dos ultimos envios de planilha. O historico com &quot;reabrir&quot; e &quot;duplicar analise&quot;
          por industria ainda nao esta disponivel nesta versao.
        </p>
      </div>

      {loading ? (
        <p className="text-[13px] text-ink-600">Carregando...</p>
      ) : logs.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-card">
          <p className="text-[13px] text-ink-600">Nenhum envio registrado ainda.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-card">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-[#94A3B8]">
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Tipo</th>
                <th className="px-4 py-2.5 font-medium">Concorrente</th>
                <th className="px-4 py-2.5 font-medium">Arquivo</th>
                <th className="px-4 py-2.5 text-right font-medium">Processadas</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(function (log) {
                var dateObj = new Date(log.createdAt);
                return (
                  <tr key={log.id} className="border-b border-line/50">
                    <td className="px-4 py-2 text-[12px] text-[#1F2937]">
                      {dateObj.toLocaleDateString("pt-BR")}{" "}
                      {dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-2 text-[12px] text-[#1F2937]">{typeLabel(log.type)}</td>
                    <td className="px-4 py-2 text-[12px] text-[#6B7280]">{log.sourceName ? log.sourceName : "-"}</td>
                    <td className="px-4 py-2 text-[12px] text-[#6B7280]">{log.fileName}</td>
                    <td className="px-4 py-2 text-right text-[12px] tabular-nums text-[#1F2937]">
                      {log.rowsProcessed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
