import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { patientId } = await req.json();
  if (!patientId) return Response.json({ error: 'patientId required' }, { status: 400 });

  const [patient, appointments] = await Promise.all([
    base44.entities.PatientRecord.filter({ id: patientId }).then(r => r[0]),
    base44.entities.Appointment.filter({ patient_id: patientId })
  ]);

  if (!patient) return Response.json({ error: 'Patient not found' }, { status: 404 });

  const today = new Date();
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const cancelledCount = appointments.filter(a => a.status === 'cancelled' || a.status === 'no_show').length;
  const totalRevenue = (patient.past_treatments || []).reduce((s, t) => s + (t.cost || 0), 0);
  const lastAppointment = completedAppointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const daysSinceLastVisit = lastAppointment
    ? Math.round((today - new Date(lastAppointment.date)) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `Você é um especialista em CRM odontológico. Analise este paciente e retorne um JSON estruturado.

DADOS DO PACIENTE:
- Nome: ${patient.patient_name}
- Idade: ${patient.date_of_birth ? Math.floor((today - new Date(patient.date_of_birth)) / (1000*60*60*24*365)) : 'desconhecida'} anos
- Status: ${patient.status || 'ativo'}
- Condições médicas: ${(patient.medical_conditions || []).join(', ') || 'nenhuma'}
- Alergias: ${(patient.allergies || []).map(a => a.allergen).join(', ') || 'nenhuma'}
- Medicamentos: ${(patient.current_medications || []).map(m => m.name).join(', ') || 'nenhum'}

HISTÓRICO DE CONSULTAS:
- Total de consultas: ${appointments.length}
- Consultas concluídas: ${completedAppointments.length}
- Cancelamentos/faltas: ${cancelledCount}
- Última visita: ${lastAppointment ? lastAppointment.date + ' (' + daysSinceLastVisit + ' dias atrás)' : 'nunca visitou'}
- Serviços realizados: ${completedAppointments.map(a => a.service_type).join(', ') || 'nenhum'}

HISTÓRICO DE TRATAMENTOS:
${(patient.past_treatments || []).map(t => `- ${t.treatment} (dente ${t.tooth_number || 'N/A'}) em ${t.date || 'data desconhecida'}, R$ ${t.cost || 0}`).join('\n') || '- Nenhum tratamento registrado'}

RECEITA TOTAL GERADA: R$ ${totalRevenue.toFixed(2)}

Retorne APENAS este JSON, sem markdown:
{
  "next_visit": {
    "predicted_date": "string (ex: 'em 30 dias' ou 'overdue - 45 dias sem visita')",
    "best_contact_time": "string (ex: 'terça ou quinta, entre 10h-12h')",
    "contact_reason": "string (motivo para o contato proativo)",
    "urgency": "low|medium|high",
    "message_suggestion": "string (mensagem sugerida para WhatsApp)"
  },
  "churn_risk": {
    "score": number (0-100, quanto maior = mais risco),
    "level": "low|medium|high|critical",
    "risk_factors": ["array de fatores de risco identificados"],
    "reengagement_campaign": {
      "title": "string",
      "approach": "string",
      "offer_suggestion": "string",
      "message_template": "string (template de mensagem)"
    }
  },
  "lifetime_value": {
    "current_ltv": number (R$),
    "projected_ltv_12m": number (R$ projetado próximos 12 meses),
    "segment": "bronze|silver|gold|platinum",
    "avg_ticket": number,
    "visit_frequency": "string (ex: 'a cada 3 meses')",
    "personalization_tips": ["dicas para personalizar atendimento"]
  },
  "treatment_suggestions": [
    {
      "treatment": "string (nome do tratamento)",
      "reason": "string (por que é indicado)",
      "priority": "preventive|recommended|urgent",
      "estimated_value": number (R$ estimado),
      "time_frame": "string (ex: 'próximos 30 dias')"
    }
  ],
  "summary": "string (resumo geral em 2-3 linhas para o atendente)"
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        next_visit: { type: "object" },
        churn_risk: { type: "object" },
        lifetime_value: { type: "object" },
        treatment_suggestions: { type: "array", items: { type: "object" } },
        summary: { type: "string" }
      }
    }
  });

  return Response.json({ analysis: result, patient_name: patient.patient_name });
});