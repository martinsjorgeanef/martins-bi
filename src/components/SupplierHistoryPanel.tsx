"use client";

import { useState, useEffect, useCallback } from "react";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

interface SupplierHistoryRow {
  id: string;
  fornecedor: string;
  estado: string;
  mes: string;
  metaVenda: number;
  venda: number;
  clientesAtendidos: number;
}

var ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

var MESES_NOMES = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatMes(mes: string) {
  var ano = mes.slice(0, 4);
  var mesNum = mes.slice(4, 6);
  var idx = parseInt(mesNum, 10);
  return (MESES_NOMES[idx] || mesNum) + "/" + ano;
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
  fornecedores: string[];
}

export function SupplierHistoryPanel({ fornecedores }: Props) {
  const [fornecedor, setFornecedor] = useState<string>(fornecedores.length > 0 ? fornecedores[0] : "");
  const [estado, setEstado] = useState<string>("RJ");
  const [rows, setRows] = useState<SupplierHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  var loadHistory = useCallback(function () {
    if (!fornecedor || !estado) return;
    setLoading(true);
    fetch("/api/supplier-history?fornecedor=" + encodeURIComponent(fornecedor) + "&estado=" + encodeURIComponent(estado))
      .then(function (res) { return res.json(); })
      .then(function (data) { setRows(data.rows || []); })
      .finally(function () { setLoading(false); });
  }, [fornecedor, estado]);

  useEffect(function () {
    loadHistory();
  }, [loadHistory]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    var file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    setUploadErr(null);

    var formData = new FormData();
    formData.append("file", file);
    formData.append("fornecedor", fornecedor);
    formData.append("estado", estado);

    fetch("/api/supplier-history/upload", { method: "POST", body: formData })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          setUploadErr(result.data.error || "Erro ao enviar o arquivo.");
          return;
        }
        setUploadMsg(result.data.created + " mes(es) novo(s), " + result.data.updated + " atualizado(s).");
        loadHistory();
      })
      .catch(function () {
        setUploadErr("Erro de conexao ao enviar o arquivo.");
      })
      .finally(function () {
        setUploading(false);
        e.target.value = "";
      });
  }

  return (
    <div className="mt-4 rounded-lg border border-line bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-bold text-ink-950">Historico do Fornecedor</h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            Meta, venda e clientes atendidos por mes para {fornecedor || "o fornecedor selecionado"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={fornecedor} onChange={function (e) { setFornecedor(e.target.value); }} className="w-56">
            {fornecedores.length === 0 ? <option value="">Nenhum fornecedor</option> : null}
            {fornecedores.map(function (f) {
              return <option key={f} value={f}>{f}</option>;
            })}
          </Select>
          <Select value={estado} onChange={function (e) { setEstado(e.target.value); }} className="w-24">
            {ESTADOS.map(function (uf) {
              return <option key={uf} value={uf}>{uf}</option>;
            })}
          </Select>
          <label>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading || !fornecedor}
            />
            <span>
              <Button variant="secondary" disabled={uploading || !fornecedor}>
                {uploading ? "Enviando..." : "Importar planilha"}
              </Button>
            </span>
          </label>
        </div>
      </div>

      {uploadMsg ? <p className="mt-2 text-[12px] text-good">{uploadMsg}</p> : null}
      {uploadErr ? <p className="mt-2 text-[12px] text-bad">{uploadErr}</p> : null}

      <div className="mt-3 overflow-x-auto">
        {loading ? (
          <p className="text-[12px] text-ink-500">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="text-[12px] text-ink-500">
            Nenhum historico para {fornecedor || "este fornecedor"} em {estado}. Importe uma planilha acima.
          </p>
        ) : (
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-line text-left text-ink-500">
                <th className="px-2 py-1.5">Mes</th>
                <th className="px-2 py-1.5 text-right">Meta</th>
                <th className="px-2 py-1.5 text-right">Venda</th>
                <th className="px-2 py-1.5 text-right">% Atingido</th>
                <th className="px-2 py-1.5 text-right">Clientes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(function (r) {
                var pct = r.metaVenda > 0 ? (r.venda / r.metaVenda) * 100 : 0;
                var tone: "good" | "warn" | "bad" = pct >= 100 ? "good" : pct >= 80 ? "warn" : "bad";
                return (
                  <tr key={r.id} className="border-b border-line/50">
                    <td className="px-2 py-1.5 font-medium text-ink-950">{formatMes(r.mes)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(r.metaVenda)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(r.venda)}</td>
                    <td className="px-2 py-1.5 text-right">
                      <Badge tone={tone}>{pct.toFixed(1)}%</Badge>
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{r.clientesAtendidos}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
