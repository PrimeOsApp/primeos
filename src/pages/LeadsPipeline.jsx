import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Users, Plus, Loader2, MessageCircle, Phone, Mail, DollarSign, ArrowRight, Flame, Pencil, Save, X, Calendar, Tag, TrendingUp, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const statusStages = [
  { id: "novo", label: "Novo", color: "bg-blue-500" },
  { id: "em_conversa", label: "Em Conversa", color: "bg-amber-500" },
  { id: "avaliacao", label: "Avaliação", color: "bg-purple-500" },
  { id: "orcamento", label: "Orçamento", color: "bg-indigo-500" },
  { id: "fechado", label: "Fechado", color: "bg-emerald-500" },
  { id: "perdido", label: "Perdido", color: "bg-red-500" }
];

const tempColors = { frio: "text-blue-500", morno: "text-amber-500", quente: "text-red-500" };
const interesseColors = { invisalign: "bg-purple-100 text-purple-700", ortodontia: "bg-blue-100 text-blue-700", limpeza: "bg-green-100 text-green-700", clareamento: "bg-amber-100 text-amber-700", implante: "bg-rose-100 text-rose-700" };

export default function LeadsPipeline() {
  const [showForm, setShowForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const queryClient = useQueryClient();

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date")
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campaign.list()
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["marketingChannels"],
    queryFn: () => base44.entities.MarketingChannel.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Lead.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setShowForm(false);
      toast.success("Lead criado!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      if (selectedLead?.id === updated.id) setSelectedLead(updated);
    }
  });

  const openLeadDetail = (lead) => {
    setSelectedLead(lead);
    setEditForm({ ...lead });
  };

  const saveEdit = () => {
    updateMutation.mutate({ id: editForm.id, data: editForm }, {
      onSuccess: () => toast.success("Lead atualizado!")
    });
  };

  const [form, setForm] = useState({
    name: "", phone: "", email: "", origem_canal_id: "",
    campanha_id: "", interesse: "invisalign", status: "novo",
    data_entrada: format(new Date(), "yyyy-MM-dd"),
    canal_conversao: "whatsapp", valor_estimado: 0,
    temperatura: "morno", notas: ""
  });

  const leadsByStatus = statusStages.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(l => l.status === stage.id);
    return acc;
  }, {});

  const totalValor = leads.filter(l => l.status === "fechado").reduce((s, l) => s + (l.valor_estimado || 0), 0);

  const openWhatsApp = (phone, name) => {
    const cleanPhone = phone?.replace(/\D/g, "") || "";
    const msg = `Olá ${name}! 👋 Vi seu interesse pela Prime Odontologia. Como posso ajudar?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Pipeline de Leads
            </h1>
            <p className="text-slate-500 mt-1">Origem → Conversão</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Valor Fechado</p>
              <p className="text-xl font-bold text-emerald-600">R$ {totalValor.toLocaleString()}</p>
            </div>
            <Button onClick={() => { setForm({ name: "", phone: "", email: "", origem_canal_id: "", campanha_id: "", interesse: "invisalign", status: "novo", data_entrada: format(new Date(), "yyyy-MM-dd"), canal_conversao: "whatsapp", valor_estimado: 0, temperatura: "morno", notas: "" }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />Novo Lead
            </Button>
          </div>
        </motion.div>

        {/* Kanban */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusStages.map((stage, idx) => (
            <div key={stage.id} className="flex-shrink-0 w-[280px]">
              <div className={cn("p-3 rounded-t-xl text-white text-center", stage.color)}>
                <p className="font-medium">{stage.label}</p>
                <p className="text-sm opacity-80">{leadsByStatus[stage.id]?.length || 0} leads</p>
              </div>
              <ScrollArea className="h-[550px] bg-slate-50 rounded-b-xl p-2">
                <div className="space-y-2">
                  {leadsByStatus[stage.id]?.map((lead) => {
                    const campaign = campaigns.find(c => c.id === lead.campanha_id);
                    const channel = channels.find(c => c.id === lead.origem_canal_id);
                    return (
                      <motion.div key={lead.id} whileHover={{ scale: 1.02 }} className="bg-white p-3 rounded-lg shadow-sm cursor-pointer" onClick={() => openLeadDetail(lead)}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{lead.name}</p>
                          <Flame className={cn("w-4 h-4", tempColors[lead.temperatura])} />
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge className={cn("text-xs", interesseColors[lead.interesse] || "bg-slate-100")}>{lead.interesse}</Badge>
                          {channel && <Badge variant="outline" className="text-xs">{channel.plataforma}</Badge>}
                        </div>
                        {lead.valor_estimado > 0 && (
                          <p className="text-xs text-emerald-600 font-medium mb-2">R$ {lead.valor_estimado.toLocaleString()}</p>
                        )}
                        <div className="flex items-center gap-2">
                          {lead.phone && (
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openWhatsApp(lead.phone, lead.name)}>
                              <MessageCircle className="w-3 h-3 text-green-600" />
                            </Button>
                          )}
                          {idx < statusStages.length - 2 && (
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => {
                              const nextStatus = statusStages[idx + 1].id;
                              updateMutation.mutate({ id: lead.id, data: { ...lead, status: nextStatus } });
                            }}>
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Nome completo" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="(11) 99999-9999" /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Interesse</Label>
                  <Select value={form.interesse} onValueChange={(v) => setForm({...form, interesse: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["invisalign", "ortodontia", "limpeza", "clareamento", "implante", "protese", "estetica", "checkup", "outro"].map(i => <SelectItem key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperatura</Label>
                  <Select value={form.temperatura} onValueChange={(v) => setForm({...form, temperatura: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frio">❄️ Frio</SelectItem>
                      <SelectItem value="morno">🌤️ Morno</SelectItem>
                      <SelectItem value="quente">🔥 Quente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origem (Canal)</Label>
                  <Select value={form.origem_canal_id} onValueChange={(v) => setForm({...form, origem_canal_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {channels.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Campanha</Label>
                  <Select value={form.campanha_id} onValueChange={(v) => setForm({...form, campanha_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Valor Estimado (R$)</Label><Input type="number" value={form.valor_estimado} onChange={(e) => setForm({...form, valor_estimado: parseFloat(e.target.value) || 0})} /></div>
              <div><Label>Notas</Label><Textarea value={form.notas} onChange={(e) => setForm({...form, notas: e.target.value})} rows={2} /></div>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}