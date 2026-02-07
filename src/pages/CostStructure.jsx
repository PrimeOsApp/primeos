import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingDown, Calendar, Building, Users, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CostStructure() {
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list(),
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  const costCategories = {
    fixed_costs: { label: "Custos Fixos", color: "bg-red-100 text-red-800" },
    variable_costs: { label: "Custos Variáveis", color: "bg-yellow-100 text-yellow-800" },
    salaries: { label: "Salários", color: "bg-blue-100 text-blue-800" },
    marketing: { label: "Marketing", color: "bg-purple-100 text-purple-800" },
    technology: { label: "Tecnologia", color: "bg-indigo-100 text-indigo-800" },
    rent: { label: "Aluguel", color: "bg-orange-100 text-orange-800" },
    utilities: { label: "Utilidades", color: "bg-green-100 text-green-800" },
    supplies: { label: "Insumos", color: "bg-pink-100 text-pink-800" }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const monthlyExpenses = expenses.filter(e => e.frequency === "monthly");
  const totalMonthly = monthlyExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const infrastructureBlocks = [
    {
      title: "Infraestrutura Física",
      icon: Building,
      items: [
        "Consultórios equipados",
        "Equipamentos odontológicos",
        "Mobiliário e decoração",
        "Sistema de esterilização"
      ]
    },
    {
      title: "Infraestrutura Humana",
      icon: Users,
      items: [
        "Dentistas especialistas",
        "Equipe de atendimento",
        "CRM e marketing",
        "Gestão administrativa"
      ]
    },
    {
      title: "Infraestrutura Tecnológica",
      icon: Zap,
      items: [
        "Prime OS - Sistema de gestão",
        "CRM e automações",
        "AI Agents (Silvia, Government)",
        "Integrações WhatsApp/Redes"
      ]
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Implementation for creating expense
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Estrutura de Custos</h1>
          <p className="text-slate-600">Bloco 9 - Business Model Canvas</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Cost Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Despesas Totais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Mensal Fixo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">{assets.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(costCategories).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Custos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(costCategories).map(([key, cat]) => {
                    const categoryExpenses = expenses.filter(e => e.category === key);
                    const total = categoryExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <Badge className={cat.color}>{cat.label}</Badge>
                          <span className="text-sm text-slate-600">{categoryExpenses.length} itens</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {infrastructureBlocks.map((block, idx) => (
                <Card key={idx} className="hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <block.icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <CardTitle>{block.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {block.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 p-2 bg-slate-50 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenses.slice(0, 12).map((expense) => (
                <Card key={expense.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{expense.title}</CardTitle>
                      <Badge className={costCategories[expense.category]?.color || "bg-slate-100"}>
                        {costCategories[expense.category]?.label || expense.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Valor:</span>
                      <span className="text-lg font-bold text-slate-900">
                        R$ {expense.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Frequência:</span>
                      <Badge variant="outline">{expense.frequency}</Badge>
                    </div>
                    {expense.vendor && (
                      <div className="pt-2 border-t text-sm text-slate-600">
                        Fornecedor: {expense.vendor}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}