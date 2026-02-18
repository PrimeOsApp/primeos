import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Calendar, AlertTriangle, DollarSign, Stethoscope,
  Loader2, RefreshCw, MessageCircle, Copy, CheckCircle, TrendingUp,
  Clock, Star, Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PatientAIInsights({ patient }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const run = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('analyzePatient', { patientId: patient.id });
    setAnalysis(res.data.analysis);
    setLoading(false);
    toast.success("Análise de IA concluída!");
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Brain className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
        <p className="font-medium text-slate-700">Analisando histórico do paciente...</p>
        <p className="text-sm text-slate-500">A IA está processando consultas, tratamentos e padrões de comportamento</p>
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <Brain className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-slate-900 mb-1">Análise de IA do Paciente</h3>
          <p className="text-sm text-slate-500 max-w-md">
            A IA analisará o histórico de consultas, tratamentos e comportamento para gerar insights personalizados.
          </p>
        </div>
        <Button onClick={run} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Brain className="w-4 h-4" />
          Gerar Análise
        </Button>
      </div>
    );
  }

  const churnColors = {
    low: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    critical: "bg-red-100 text-red-700 border-red-200"
  };

  const urgencyColors = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-red-600"
  };

  const segmentColors = {
    bronze: "bg-amber-700 text-white",
    silver: "bg-slate-400 text-white",
    gold: "bg-yellow-500 text-white",
    platinum: "bg-indigo-600 text-white"
  };

  const priorityConfig = {
    preventive: { label: "Preventivo", color: "bg-blue-100 text-blue-700" },
    recommended: { label: "Recomendado", color: "bg-indigo-100 text-indigo-700" },
    urgent: { label: "Urgente", color: "bg-red-100 text-red-700" }
  };

  const nv = analysis.next_visit;
  const cr = analysis.churn_risk;
  const ltv = analysis.lifetime_value;
  const ts = analysis.treatment_suggestions || [];

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      {analysis.summary && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex gap-3">
          <Brain className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-800">{analysis.summary}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Visit Prediction */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Próxima Visita Prevista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">{nv?.predicted_date}</p>
              <span className={cn("text-sm font-medium", urgencyColors[nv?.urgency])}>
                {nv?.urgency === 'high' ? '🔴 Urgente' : nv?.urgency === 'medium' ? '🟡 Médio' : '🟢 Ok'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Melhor horário: <strong>{nv?.best_contact_time}</strong></span>
              </div>
              <p className="text-sm text-slate-600">
                <strong>Motivo:</strong> {nv?.contact_reason}
              </p>
            </div>

            {nv?.message_suggestion && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <MessageCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-800 leading-relaxed">{nv.message_suggestion}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => copy(nv.message_suggestion)}>
                    <Copy className="w-3.5 h-3.5 text-green-600" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Churn Risk */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Risco de Abandono
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <Badge className={churnColors[cr?.level]}>{cr?.level?.toUpperCase()}</Badge>
              <span className="text-2xl font-bold text-slate-900">{cr?.score}%</span>
            </div>
            <Progress value={cr?.score} className="h-2" />

            {cr?.risk_factors?.length > 0 && (
              <div className="space-y-1">
                {cr.risk_factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-orange-500 mt-0.5">•</span>
                    {f}
                  </div>
                ))}
              </div>
            )}

            {cr?.reengagement_campaign && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-purple-900">
                  💡 {cr.reengagement_campaign.title}
                </p>
                <p className="text-xs text-purple-700">{cr.reengagement_campaign.offer_suggestion}</p>
                {cr.reengagement_campaign.message_template && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-purple-700 p-0" onClick={() => copy(cr.reengagement_campaign.message_template)}>
                    <Copy className="w-3 h-3" /> Copiar mensagem
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lifetime Value */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Lifetime Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">LTV Atual</p>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {(ltv?.current_ltv || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Projeção 12 meses</p>
                <p className="text-xl font-bold text-indigo-600">
                  R$ {(ltv?.projected_ltv_12m || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {ltv?.segment && (
                <Badge className={cn("gap-1", segmentColors[ltv.segment])}>
                  <Star className="w-3 h-3" />
                  {ltv.segment.charAt(0).toUpperCase() + ltv.segment.slice(1)}
                </Badge>
              )}
              <span className="text-xs text-slate-500">
                Ticket médio: R$ {(ltv?.avg_ticket || 0).toLocaleString('pt-BR')} • {ltv?.visit_frequency}
              </span>
            </div>

            {ltv?.personalization_tips?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">Dicas de personalização:</p>
                {ltv.personalization_tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Treatment Suggestions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              Tratamentos Sugeridos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma sugestão de tratamento</p>
            ) : (
              ts.slice(0, 4).map((t, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900">{t.treatment}</p>
                    <Badge className={cn("text-xs flex-shrink-0", priorityConfig[t.priority]?.color)}>
                      {priorityConfig[t.priority]?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{t.reason}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {t.time_frame}
                    </span>
                    {t.estimated_value > 0 && (
                      <span className="font-medium text-emerald-600">
                        ~R$ {t.estimated_value.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={run} variant="outline" className="gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refazer Análise
        </Button>
      </div>
    </div>
  );
}