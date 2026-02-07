import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Target, TrendingUp, Plus, Edit, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CustomerSegments() {
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: segments = [] } = useQuery({
    queryKey: ['customerSegments'],
    queryFn: () => base44.entities.CustomerSegment.list(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
  });

  const createSegmentMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomerSegment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerSegments'] });
      setIsDialogOpen(false);
    },
  });

  const personas = [
    {
      name: "Lucas Andrade",
      age: 29,
      profession: "Advogado",
      goal: "Transmitir confiança profissional",
      pain: "Dentes levemente tortos",
      solution: "Invisalign discreto",
      icon: "👨‍💼"
    },
    {
      name: "Mariana Lopes",
      age: 26,
      profession: "Criadora de Conteúdo",
      goal: "Sorriso natural e confiante",
      pain: "Dentes manchados",
      solution: "Estética natural + clareamento",
      icon: "👩‍💻"
    },
    {
      name: "Ricardo Menezes",
      age: 42,
      profession: "Empresário",
      goal: "Discrição e excelência",
      pain: "Desalinhamento antigo",
      solution: "Invisalign premium",
      icon: "👔"
    },
    {
      name: "Camila Rocha",
      age: 34,
      profession: "Nutricionista",
      goal: "Saúde + Estética",
      pain: "Dificuldade higienização",
      solution: "Tratamento funcional",
      icon: "🏥"
    },
    {
      name: "Pedro Azevedo",
      age: 22,
      profession: "Startup",
      goal: "Tecnologia de ponta",
      pain: "Nunca quis aparelho metálico",
      solution: "Experiência digital",
      icon: "💡"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createSegmentMutation.mutate({
      name: formData.get('name'),
      descricao: formData.get('descricao'),
      cor: formData.get('cor'),
      ativo: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Segmentos de Clientes</h1>
            <p className="text-slate-600">Bloco 1 - Business Model Canvas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Segmento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Segmento de Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nome do Segmento</Label>
                  <Input name="name" required />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea name="descricao" rows={3} />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input name="cor" type="color" defaultValue="#6366f1" />
                </div>
                <Button type="submit" className="w-full">Criar Segmento</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Segmentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{segments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Segmentos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {segments.filter(s => s.ativo).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{leads.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Leads Quentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {leads.filter(l => l.temperatura === 'quente').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Segments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Segmentos Estratégicos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: segment.cor }}
                      />
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                    </div>
                    <Badge variant={segment.ativo ? "default" : "secondary"}>
                      {segment.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">{segment.descricao}</p>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{segment.total_leads || 0} leads</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Personas */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Personas Prime Odontologia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-200">
                <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl">{persona.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <p className="text-sm text-slate-600">{persona.age} anos • {persona.profession}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Objetivo</p>
                        <p className="text-sm text-slate-600">{persona.goal}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-500 text-sm">😟</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Dor</p>
                        <p className="text-sm text-slate-600">{persona.pain}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 text-sm">💡</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Solução</p>
                        <p className="text-sm text-slate-600">{persona.solution}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}