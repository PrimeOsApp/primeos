import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Trash2, AlertTriangle, Eye } from "lucide-react";

const ENTITIES = [
  { key: "PatientRecord", label: "Pacientes", color: "text-rose-400" },
  { key: "Appointment", label: "Consultas", color: "text-blue-400" },
  { key: "Lead", label: "Leads", color: "text-indigo-400" },
  { key: "Task", label: "Tarefas", color: "text-amber-400" },
  { key: "MedicalRecord", label: "Prontuários", color: "text-teal-400" },
  { key: "POP", label: "POPs", color: "text-purple-400" },
  { key: "Customer", label: "Clientes", color: "text-green-400" },
  { key: "Interaction", label: "Interações", color: "text-cyan-400" },
  { key: "CRMAppointment", label: "Agend. CRM", color: "text-orange-400" },
  { key: "Activity", label: "Atividades", color: "text-pink-400" },
  { key: "Campaign", label: "Campanhas", color: "text-violet-400" },
  { key: "Content", label: "Conteúdos", color: "text-lime-400" },
];

function EntityRow({ entity }) {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await primeos.entities[entity.key].list('-created_date', 1);
    // Just count a broader fetch for display
    const all = await primeos.entities[entity.key].list('-created_date', 500);
    setCount(all.length);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <Database className={`w-4 h-4 ${entity.color}`} />
        <div>
          <p className="text-white text-sm font-medium">{entity.label}</p>
          <p className="text-slate-500 text-xs font-mono">{entity.key}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {count !== null && (
          <Badge className="bg-slate-600 text-slate-300 border-slate-500 text-xs">{count} registros</Badge>
        )}
        <Button size="sm" variant="outline" onClick={load} disabled={loading}
          className="h-7 text-xs border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600">
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3 mr-1" />}
          {count === null ? "Contar" : "Recarregar"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminDataTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Database className="w-4 h-4" /> Entidades do Sistema
          </CardTitle>
          <p className="text-slate-500 text-xs">Clique em "Contar" para ver quantos registros cada entidade possui.</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {ENTITIES.map(e => <EntityRow key={e.key} entity={e} />)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-900/20 border-red-800/50">
        <CardHeader>
          <CardTitle className="text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">
            Ações irreversíveis. Use com extremo cuidado. Todas as exclusões são permanentes.
          </p>
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-red-800/30">
            <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Exclusão de Dados</p>
              <p className="text-slate-500 text-xs">Para excluir dados em massa, acesse o dashboard do PrimeOS → Entities → gerenciar registros diretamente no banco.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}