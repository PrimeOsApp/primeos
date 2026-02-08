import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch leads and interactions
    const leads = await base44.entities.Lead.list();
    const interactions = await base44.entities.Interaction.list();
    const appointments = await base44.entities.CRMAppointment.list();

    // Analyze each lead for follow-up needs
    const leadsAnalysis = leads.map(lead => {
      const leadInteractions = interactions
        .filter(i => i.customer_id === lead.id)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      
      const lastInteraction = leadInteractions[0];
      const daysSinceLastContact = lastInteraction ? 
        Math.floor((new Date() - new Date(lastInteraction.created_date)) / (1000 * 60 * 60 * 24)) : 999;
      
      const leadAppointments = appointments.filter(a => a.customer_id === lead.id);
      const upcomingAppointment = leadAppointments.find(a => 
        new Date(a.date) > new Date() && a.status !== 'cancelled'
      );

      return {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        stage: lead.stage,
        status: lead.status,
        score: lead.score || 0,
        source: lead.source,
        interest: lead.interest,
        last_interaction_date: lastInteraction?.created_date,
        last_interaction_type: lastInteraction?.type,
        last_interaction_outcome: lastInteraction?.outcome,
        days_since_last_contact: daysSinceLastContact,
        total_interactions: leadInteractions.length,
        has_upcoming_appointment: !!upcomingAppointment,
        next_action: lead.next_action
      };
    });

    const prompt = `Você é um especialista em gestão de relacionamento e engajamento de leads para a Prime Odontologia.

LEADS PARA ANÁLISE:
${JSON.stringify(leadsAnalysis, null, 2)}

Analise cada lead e identifique:
1. Quais leads precisam de follow-up urgente (sinais de desengajamento)
2. Qual o melhor timing para cada follow-up
3. O canal ideal (WhatsApp, email, ligação)
4. Mensagem personalizada sugerida
5. Prioridade do follow-up (crítico/alto/médio/baixo)
6. Razão específica para o follow-up

SINAIS DE ENGAJAMENTO A CONSIDERAR:
- Dias sem contato (mais de 7 dias = risco)
- Score do lead (alto score = prioridade)
- Estágio no pipeline
- Outcome da última interação
- Frequência de interações
- Presença de agendamento futuro

Forneça recomendações acionáveis e priorizadas.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          urgent_follow_ups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lead_id: { type: "string" },
                lead_name: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                reason: { type: "string" },
                recommended_channel: { type: "string" },
                timing: { type: "string" },
                suggested_message: { type: "string" },
                engagement_score: { type: "number" },
                risk_of_losing: { type: "boolean" }
              }
            }
          },
          engagement_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight: { type: "string" },
                affected_leads: { type: "number" },
                recommendation: { type: "string" }
              }
            }
          },
          total_follow_ups_needed: { type: "number" },
          critical_count: { type: "number" }
        }
      }
    });

    return Response.json({ success: true, data: response, leads_analyzed: leadsAnalysis.length });

  } catch (error) {
    console.error('Follow-up Reminders Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});