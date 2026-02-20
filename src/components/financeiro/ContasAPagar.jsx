import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, CheckCircle, Clock, TrendingDown, Search,
  Bell, Calendar, Plus, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { format, isPast, isToday, differenceInDays, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig = {
  pago: { label: "Pago", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700 border-amber-200" },
  vencido: { label: "Vencido", color: "bg-red-100 text-red-700 border-red-200" },
  cancelado: { label: "Cancelado", color: "bg-slate-100 text-slate-500 border-slate-200" },
};

function DueDateBadge({ dueDate }) {
  if (!dueDate) return null;
  const date = parseISO(dueDate);
  const days = differenceInDays(date, new Date());
  if (isPast(date) && !isToday(date)) {
    return <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Venceu {Math.abs(days)}d atrás</span>;
  }
  if (isToday(date)) {
    return <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><Bell className="w-3 h-3" /> Vence hoje</span>;
  }
  if (days <= 3) {
    return <span className="text-xs text-amber-500 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Vence em {days}d</span>;
  }
  return <span className="text-xs text-slate-400">{format(date, "dd/MM/yyyy", { locale: ptBR })}</span>;
}

export default function ContasAPagar({ onAddNew }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState({});

  const { data: transactions = [] } = useQuery({
    queryKey: ["financialTransactions"],
    queryFn: () => base44.entities.FinancialTransaction.list("-due_date"),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancialTransaction.update(id, { status: "pago" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });
      toast.success("Marcado como pago!");
    }
  });

  const despesas = useMemo(() => transactions.filter(t => t.type === "despesa"), [transactions]);

  const filtered = useMemo(() => despesas.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  }), [despesas, search, filterStatus]);

  // KPIs
  const totalPendente = despesas.filter(t => t.status === "pendente").reduce((s, t) => s + (t.amount || 0), 0);
  const totalVencido = despesas.filter(t => t.status === "vencido").reduce((s, t) => s + (t.amount || 0), 0);
  const vencendoHoje = despesas.filter(t => t.due_date && isToday(parseISO(t.due_date)) && t.status === "pendente");
  const vencendoEmBreve = despesas.filter(t => {
    if (!t.due_date || t.status !== "pendente") return false;
    const days = differenceInDays(parseISO(t.due_date), new Date());
    return days > 0 && days <= 7;
  });

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {totalVencido > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold text-sm">Contas Vencidas!</p>
            <p className="text-red-600 text-xs mt-0.5">
              R$ {totalVencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em {despesas.filter(t => t.status === "vencido").length} conta(s) vencida(s).
            </p>
          </div>
        </div>
      )}
      {vencendoHoje.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-semibold text-sm">{vencendoHoje.length} conta(s) vencem hoje</p>
            <p className="text-amber-600 text-xs mt-0.5">
              Total: R$ {vencendoHoje.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
      {vencendoEmBreve.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 font-semibold text-sm">{vencendoEmBreve.length} conta(s) vencem nos próximos 7 dias</p>
            <p className="text-blue-600 text-xs mt-0.5">
              Total: R$ {vencendoEmBreve.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Pendente", value: totalPendente, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
          { label: "Total Vencido", value: totalVencido, color: "text-red-700", bg: "bg-red-50 border-red-100" },
          { label: "Vence Hoje", value: vencendoHoje.reduce((s, t) => s + (t.amount || 0), 0), color: "text-orange-700", bg: "bg-orange-50 border-orange-100" },
          { label: "Próximos 7d", value: vencendoEmBreve.reduce((s, t) => s + (t.amount || 0), 0), color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
        ].map((k, i) => (
          <Card key={i} className={`border ${k.bg} shadow-none`}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className={`text-lg font-bold ${k.color} mt-1`}>R$ {k.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Buscar despesa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" onClick={() => onAddNew("despesa")}>
          <Plus className="w-4 h-4" /> Nova Despesa
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Nenhuma despesa encontrada.</p>
          </div>
        )}
        {filtered.map(t => (
          <Card key={t.id} className="border border-slate-100 shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 text-sm truncate">{t.description}</p>
                    <Badge className={`text-xs border ${statusConfig[t.status]?.color || statusConfig.pendente.color}`}>
                      {statusConfig[t.status]?.label || t.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {t.supplier && <span className="text-xs text-slate-500">{t.supplier}</span>}
                    <span className="text-xs text-slate-400 capitalize">{t.category?.replace(/_/g, " ")}</span>
                    <DueDateBadge dueDate={t.due_date} />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="font-bold text-rose-600 text-sm">
                    R$ {(t.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  {t.status !== "pago" && t.status !== "cancelado" && (
                    <Button size="sm" variant="outline" onClick={() => markPaidMutation.mutate(t.id)}
                      disabled={markPaidMutation.isPending}
                      className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1">
                      {markPaidMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Pagar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}