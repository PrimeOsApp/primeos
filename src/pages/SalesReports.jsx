import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, DollarSign, Target, Award } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export default function SalesReports() {
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => base44.entities.Sale.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  // Conversion Rate by Stage
  const stageData = [
    { stage: "Novos", count: leads.filter((l) => l.stage === "new").length },
    { stage: "Contatados", count: leads.filter((l) => l.stage === "contacted").length },
    { stage: "Qualificados", count: leads.filter((l) => l.stage === "qualified").length },
    { stage: "Proposta", count: leads.filter((l) => l.stage === "proposal").length },
    { stage: "Negociação", count: leads.filter((l) => l.stage === "negotiation").length },
    { stage: "Ganho", count: leads.filter((l) => l.stage === "closed_won").length },
  ];

  // Team Performance
  const teamPerformance = leads.reduce((acc, lead) => {
    if (lead.assigned_to) {
      if (!acc[lead.assigned_to]) {
        acc[lead.assigned_to] = {
          name: lead.assigned_to,
          total: 0,
          won: 0,
          value: 0,
        };
      }
      acc[lead.assigned_to].total++;
      if (lead.stage === "closed_won") {
        acc[lead.assigned_to].won++;
        acc[lead.assigned_to].value += lead.estimated_value || 0;
      }
    }
    return acc;
  }, {});

  const teamData = Object.values(teamPerformance).map((member) => ({
    ...member,
    conversionRate: member.total > 0 ? ((member.won / member.total) * 100).toFixed(1) : 0,
  }));

  // Lead Source Distribution
  const sourceData = leads.reduce((acc, lead) => {
    const source = lead.source || "Desconhecido";
    if (!acc[source]) {
      acc[source] = { name: source, value: 0 };
    }
    acc[source].value++;
    return acc;
  }, {});

  const sourceChartData = Object.values(sourceData);

  // Revenue Over Time
  const revenueByMonth = sales.reduce((acc, sale) => {
    if (sale.created_date) {
      const month = new Date(sale.created_date).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, count: 0 };
      }
      acc[month].revenue += sale.total_amount || 0;
      acc[month].count++;
    }
    return acc;
  }, {});

  const revenueData = Object.values(revenueByMonth).slice(-6);

  // Stats
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const avgDealSize =
    leads.filter((l) => l.stage === "closed_won").length > 0
      ? totalRevenue / leads.filter((l) => l.stage === "closed_won").length
      : 0;
  const overallConversion =
    leads.length > 0
      ? ((leads.filter((l) => l.stage === "closed_won").length / leads.length) * 100).toFixed(1)
      : 0;
  const avgLeadScore =
    leads.length > 0
      ? (leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length).toFixed(0)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Relatórios de Vendas</h1>
          <p className="text-slate-500 mt-1">
            Performance detalhada e análise do funil de vendas
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    R$ {totalRevenue.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Ticket Médio</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    R$ {avgDealSize.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {overallConversion}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Score Médio</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{avgLeadScore}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="funnel">Funil</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="sources">Fontes</TabsTrigger>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Taxa de Conversão por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Performance da Equipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData.map((member, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{member.name}</h4>
                            <p className="text-sm text-slate-500">
                              {member.won} / {member.total} leads convertidos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">
                            {member.conversionRate}%
                          </p>
                          <p className="text-sm text-slate-500">
                            R$ {member.value.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${member.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Distribuição por Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Receita ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Receita"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}