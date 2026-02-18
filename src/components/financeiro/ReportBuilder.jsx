import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Filter } from "lucide-react";
import { parseISO, format, isWithinInterval } from "date-fns";
import { toast } from "sonner";

const fmtBRL = (v) => `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const REPORT_TYPES = [
  { value: "pnl", label: "DRE – Demonstrativo de Resultado", icon: TrendingUp },
  { value: "cashflow", label: "Fluxo de Caixa", icon: DollarSign },
  { value: "balance", label: "Balanço Patrimonial Simplificado", icon: FileText },
  { value: "category", label: "Relatório por Categoria", icon: Filter },
];

const CATEGORIES = [
  "consulta","procedimento","material","equipamento","aluguel","salario","marketing","impostos","outros_receita","outros_despesa"
];

function PnLReport({ transactions }) {
  const receitas = transactions.filter(t => t.type === "receita" && t.status !== "cancelado");
  const despesas = transactions.filter(t => t.type === "despesa" && t.status !== "cancelado");
  const totalReceita = receitas.reduce((s, t) => s + (t.amount || 0), 0);
  const totalDespesa = despesas.reduce((s, t) => s + (t.amount || 0), 0);
  const lucro = totalReceita - totalDespesa;
  const margin = totalReceita > 0 ? (lucro / totalReceita) * 100 : 0;

  // Group revenues by category
  const recCat = {};
  receitas.forEach(t => { recCat[t.category] = (recCat[t.category] || 0) + (t.amount || 0); });
  const despCat = {};
  despesas.forEach(t => { despCat[t.category] = (despCat[t.category] || 0) + (t.amount || 0); });

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm">
        <h3 className="font-bold text-center text-slate-900 mb-4 uppercase tracking-wide text-base">
          DRE – Demonstrativo de Resultado do Exercício
        </h3>
        <div className="border-t border-slate-200 pt-3">
          <p className="font-bold text-emerald-700 mb-2">RECEITAS</p>
          {Object.entries(recCat).map(([cat, val]) => (
            <div key={cat} className="flex justify-between py-0.5 text-slate-600">
              <span className="ml-4 capitalize">{cat.replace(/_/g, " ")}</span>
              <span>{fmtBRL(val)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-emerald-700 border-t border-slate-300 pt-1 mt-1">
            <span>TOTAL RECEITAS</span><span>{fmtBRL(totalReceita)}</span>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-3 mt-3">
          <p className="font-bold text-rose-700 mb-2">DESPESAS</p>
          {Object.entries(despCat).map(([cat, val]) => (
            <div key={cat} className="flex justify-between py-0.5 text-slate-600">
              <span className="ml-4 capitalize">{cat.replace(/_/g, " ")}</span>
              <span>({fmtBRL(val)})</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-rose-700 border-t border-slate-300 pt-1 mt-1">
            <span>TOTAL DESPESAS</span><span>({fmtBRL(totalDespesa)})</span>
          </div>
        </div>
        <div className={`flex justify-between font-bold text-lg border-t-2 border-slate-400 pt-2 mt-3 ${lucro >= 0 ? "text-indigo-700" : "text-red-700"}`}>
          <span>LUCRO / PREJUÍZO LÍQUIDO</span>
          <span>{lucro >= 0 ? fmtBRL(lucro) : `(${fmtBRL(Math.abs(lucro))})`}</span>
        </div>
        <div className="text-right text-xs text-slate-500 mt-1">Margem líquida: {margin.toFixed(1)}%</div>
      </div>
    </div>
  );
}

function CashFlowReport({ transactions }) {
  // Group by month
  const months = {};
  transactions.filter(t => t.status !== "cancelado").forEach(t => {
    if (!t.date) return;
    const key = format(parseISO(t.date), "yyyy-MM");
    if (!months[key]) months[key] = { receita: 0, despesa: 0 };
    months[key][t.type] += t.amount || 0;
  });
  const rows = Object.entries(months).sort(([a], [b]) => a.localeCompare(b));
  let accumulated = 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="bg-slate-100 text-slate-700">
            <th className="text-left p-2">Período</th>
            <th className="text-right p-2 text-emerald-700">Entradas</th>
            <th className="text-right p-2 text-rose-700">Saídas</th>
            <th className="text-right p-2 text-indigo-700">Saldo Mensal</th>
            <th className="text-right p-2 text-slate-700">Saldo Acumulado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([month, { receita, despesa }]) => {
            const saldo = receita - despesa;
            accumulated += saldo;
            return (
              <tr key={month} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-2">{format(parseISO(month + "-01"), "MMM/yyyy")}</td>
                <td className="text-right p-2 text-emerald-600">{fmtBRL(receita)}</td>
                <td className="text-right p-2 text-rose-600">({fmtBRL(despesa)})</td>
                <td className={`text-right p-2 font-semibold ${saldo >= 0 ? "text-indigo-600" : "text-red-600"}`}>{fmtBRL(saldo)}</td>
                <td className={`text-right p-2 font-bold ${accumulated >= 0 ? "text-slate-900" : "text-red-700"}`}>{fmtBRL(accumulated)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">Sem transações no período selecionado</p>}
    </div>
  );
}

function CategoryReport({ transactions }) {
  const data = {};
  transactions.filter(t => t.status !== "cancelado").forEach(t => {
    const key = `${t.type}__${t.category}`;
    if (!data[key]) data[key] = { type: t.type, category: t.category, count: 0, total: 0 };
    data[key].count++;
    data[key].total += t.amount || 0;
  });
  const totalRec = Object.values(data).filter(d => d.type === "receita").reduce((s, d) => s + d.total, 0);
  const totalDesp = Object.values(data).filter(d => d.type === "despesa").reduce((s, d) => s + d.total, 0);
  const rows = Object.values(data).sort((a, b) => b.total - a.total);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 text-slate-700 text-xs uppercase">
            <th className="text-left p-2">Tipo</th>
            <th className="text-left p-2">Categoria</th>
            <th className="text-right p-2">Qtd</th>
            <th className="text-right p-2">Total</th>
            <th className="text-right p-2">% do Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const base = row.type === "receita" ? totalRec : totalDesp;
            return (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-2">
                  <Badge className={row.type === "receita" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                    {row.type}
                  </Badge>
                </td>
                <td className="p-2 capitalize text-slate-700">{row.category.replace(/_/g, " ")}</td>
                <td className="text-right p-2 text-slate-500">{row.count}</td>
                <td className={`text-right p-2 font-semibold ${row.type === "receita" ? "text-emerald-700" : "text-rose-700"}`}>{fmtBRL(row.total)}</td>
                <td className="text-right p-2 text-slate-500">{base > 0 ? `${((row.total / base) * 100).toFixed(1)}%` : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">Sem dados</p>}
    </div>
  );
}

function BalanceReport({ transactions }) {
  const paid = transactions.filter(t => t.status === "pago");
  const pending = transactions.filter(t => t.status === "pendente");
  const overdue = transactions.filter(t => t.status === "vencido");

  const totalReceived = paid.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const totalPaid = paid.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);
  const toReceive = pending.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const toPay = pending.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);
  const overdueRec = overdue.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const overdueDesp = overdue.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);

  const rows = [
    { label: "Caixa (Receitas Pagas)", value: totalReceived, color: "text-emerald-700" },
    { label: "Obrigações Pagas", value: -totalPaid, color: "text-rose-700" },
    { label: "Contas a Receber", value: toReceive, color: "text-blue-700" },
    { label: "Contas a Pagar", value: -toPay, color: "text-amber-700" },
    { label: "Receitas Vencidas", value: overdueRec, color: "text-orange-700" },
    { label: "Despesas Vencidas", value: -overdueDesp, color: "text-red-700" },
  ];
  const patrimonio = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div className="font-mono text-sm space-y-2">
      <h3 className="font-bold text-center text-slate-900 mb-4 uppercase tracking-wide">Balanço Patrimonial Simplificado</h3>
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between border-b border-slate-100 py-1.5">
          <span className="text-slate-600">{r.label}</span>
          <span className={`font-semibold ${r.color}`}>{r.value >= 0 ? fmtBRL(r.value) : `(${fmtBRL(Math.abs(r.value))})`}</span>
        </div>
      ))}
      <div className={`flex justify-between font-bold text-base border-t-2 border-slate-400 pt-2 ${patrimonio >= 0 ? "text-indigo-700" : "text-red-700"}`}>
        <span>PATRIMÔNIO LÍQUIDO</span>
        <span>{patrimonio >= 0 ? fmtBRL(patrimonio) : `(${fmtBRL(Math.abs(patrimonio))})`}</span>
      </div>
    </div>
  );
}

export default function ReportBuilder({ transactions }) {
  const [reportType, setReportType] = useState("pnl");
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterCat, setFilterCat] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date) return false;
      const d = parseISO(t.date);
      const inRange = isWithinInterval(d, { start: parseISO(startDate), end: parseISO(endDate) });
      const matchCat = filterCat === "all" || t.category === filterCat;
      const matchType = filterType === "all" || t.type === filterType;
      return inRange && matchCat && matchType;
    });
  }, [transactions, startDate, endDate, filterCat, filterType]);

  const exportCSV = () => {
    const headers = ["Data", "Tipo", "Categoria", "Descrição", "Valor", "Status", "Método", "Paciente", "Fornecedor"];
    const rows = filtered.map(t => [
      t.date, t.type, t.category, t.description, t.amount, t.status, t.payment_method, t.patient_name || "", t.supplier || ""
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `relatorio_financeiro_${reportType}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado!");
  };

  const currentType = REPORT_TYPES.find(r => r.value === reportType);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Data Inicial</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Data Final</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Categoria</Label>
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={exportCSV} className="ml-auto">
              <Download className="w-4 h-4 mr-2" />Exportar CSV
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-3">{filtered.length} transações no período selecionado</p>
        </CardContent>
      </Card>

      {/* Report */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          {currentType && <currentType.icon className="w-5 h-5 text-indigo-600" />}
          <CardTitle className="text-base">{currentType?.label}</CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === "pnl" && <PnLReport transactions={filtered} />}
          {reportType === "cashflow" && <CashFlowReport transactions={filtered} />}
          {reportType === "balance" && <BalanceReport transactions={filtered} />}
          {reportType === "category" && <CategoryReport transactions={filtered} />}
        </CardContent>
      </Card>
    </div>
  );
}