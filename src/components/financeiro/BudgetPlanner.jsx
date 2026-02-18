import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Target, TrendingUp, TrendingDown, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { parseISO, getYear, getMonth } from "date-fns";
import { cn } from "@/lib/utils";

const fmtBRL = (v) => `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const CATEGORIES_RECEITA = ["consulta", "procedimento", "outros_receita"];
const CATEGORIES_DESPESA = ["material", "equipamento", "aluguel", "salario", "marketing", "impostos", "outros_despesa"];
const ALL_CATEGORIES = [...CATEGORIES_RECEITA, ...CATEGORIES_DESPESA];

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

const emptyBudget = { name: "", period: "mensal", year: CURRENT_YEAR, month: CURRENT_MONTH, quarter: 1, category: "material", type: "despesa", budgeted_amount: "", notes: "" };

export default function BudgetPlanner({ transactions }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBudget);
  const [viewYear, setViewYear] = useState(CURRENT_YEAR);
  const [viewMonth, setViewMonth] = useState(CURRENT_MONTH);

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => base44.entities.Budget.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Budget.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); setShowForm(false); toast.success("Orçamento criado!"); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Budget.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); setShowForm(false); toast.success("Atualizado!"); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Budget.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); toast.success("Removido!"); }
  });

  // Filter transactions for current view period
  const periodTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date || t.status === "cancelado") return false;
      const d = parseISO(t.date);
      return getYear(d) === viewYear && getMonth(d) + 1 === viewMonth;
    });
  }, [transactions, viewYear, viewMonth]);

  // Get actual spent/received by category
  const actuals = useMemo(() => {
    const map = {};
    periodTransactions.forEach(t => {
      const key = `${t.type}__${t.category}`;
      map[key] = (map[key] || 0) + (t.amount || 0);
    });
    return map;
  }, [periodTransactions]);

  const monthBudgets = useMemo(() =>
    budgets.filter(b => b.period === "mensal" && b.year === viewYear && b.month === viewMonth),
    [budgets, viewYear, viewMonth]
  );

  const openNew = () => {
    setForm(emptyBudget);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (b) => {
    setForm({ ...b, budgeted_amount: String(b.budgeted_amount) });
    setEditing(b);
    setShowForm(true);
  };

  const handleSave = () => {
    const data = { ...form, budgeted_amount: parseFloat(form.budgeted_amount) || 0, year: parseInt(form.year), month: parseInt(form.month) };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  // Summary
  const totalBudgetedRec = monthBudgets.filter(b => b.type === "receita").reduce((s, b) => s + (b.budgeted_amount || 0), 0);
  const totalBudgetedDesp = monthBudgets.filter(b => b.type === "despesa").reduce((s, b) => s + (b.budgeted_amount || 0), 0);
  const totalActualRec = periodTransactions.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const totalActualDesp = periodTransactions.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);

  const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(viewMonth)} onValueChange={v => setViewMonth(parseInt(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(viewYear)} onValueChange={v => setViewYear(parseInt(v))}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />Nova Meta Orçamentária
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Orçada", value: totalBudgetedRec, color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
          { label: "Receita Realizada", value: totalActualRec, color: "text-emerald-700", bg: "bg-emerald-100", icon: TrendingUp },
          { label: "Despesa Orçada", value: totalBudgetedDesp, color: "text-rose-600", bg: "bg-rose-50", icon: TrendingDown },
          { label: "Despesa Realizada", value: totalActualDesp, color: "text-rose-700", bg: "bg-rose-100", icon: TrendingDown },
        ].map((k, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className={`text-lg font-bold ${k.color}`}>{fmtBRL(k.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget vs Actual Breakdown */}
      <div className="grid lg:grid-cols-2 gap-5">
        {["receita", "despesa"].map(tipo => {
          const budgetsOfType = monthBudgets.filter(b => b.type === tipo);
          return (
            <Card key={tipo} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm flex items-center gap-2 ${tipo === "receita" ? "text-emerald-700" : "text-rose-700"}`}>
                  {tipo === "receita" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {tipo === "receita" ? "Receitas" : "Despesas"} — Orçado vs. Realizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {budgetsOfType.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhuma meta definida. <button onClick={openNew} className="text-indigo-600 underline">Adicionar</button></p>
                )}
                {budgetsOfType.map(b => {
                  const actual = actuals[`${b.type}__${b.category}`] || 0;
                  const pct = b.budgeted_amount > 0 ? Math.min((actual / b.budgeted_amount) * 100, 100) : 0;
                  const over = actual > b.budgeted_amount && b.budgeted_amount > 0;
                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {over && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          <span className="font-medium capitalize text-slate-700">{b.category.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-semibold", over ? "text-amber-600" : "text-slate-600")}>
                            {fmtBRL(actual)} / {fmtBRL(b.budgeted_amount)}
                          </span>
                          <button onClick={() => openEdit(b)} className="text-slate-400 hover:text-slate-600">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteMutation.mutate(b.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <Progress value={pct} className={cn("h-2", over ? "[&>div]:bg-amber-500" : tipo === "receita" ? "[&>div]:bg-emerald-500" : "[&>div]:bg-rose-500")} />
                      <p className="text-xs text-slate-400 text-right">{pct.toFixed(0)}% {over ? "⚠️ Excedido" : "utilizado"}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Budget Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              {editing ? "Editar Meta" : "Nova Meta Orçamentária"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Salários Janeiro 2025" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v, category: v === "receita" ? "consulta" : "material" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(form.type === "receita" ? CATEGORIES_RECEITA : CATEGORIES_DESPESA).map(c => (
                      <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mês</Label>
                <Select value={String(form.month)} onValueChange={v => setForm(f => ({ ...f, month: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ano</Label>
                <Select value={String(form.year)} onValueChange={v => setForm(f => ({ ...f, year: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2024,2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Valor Orçado (R$)</Label>
              <Input type="number" value={form.budgeted_amount} onChange={e => setForm(f => ({ ...f, budgeted_amount: e.target.value }))} placeholder="0,00" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={!form.name || !form.budgeted_amount}>
                {editing ? "Salvar" : "Criar Meta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}