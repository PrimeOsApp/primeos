import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timeframe = 30 } = await req.json();

    // Fetch pipeline data
    const leads = await base44.entities.Lead.list();
    const interactions = await base44.entities.Interaction.list();
    const sales = await base44.entities.Sale.list();
    
    // Prepare pipeline data
    const pipelineData = leads.map(lead => {
      const leadInteractions = interactions.filter(i => i.customer_id === lead.id);
      const lastInteraction = leadInteractions.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      )[0];
      
      return {
        id: lead.id,
        stage: lead.stage,
        value: lead.estimated_value || 0,
        score: lead.score || 0,
        days_in_pipeline: lead.created_date ? 
          Math.floor((new Date() - new Date(lead.created_date)) / (1000 * 60 * 60 * 24)) : 0,
        interactions_count: leadInteractions.length,
        last_interaction_date: lastInteraction?.created_date,
        last_interaction_outcome: lastInteraction?.outcome,
        source: lead.source
      };
    });

    // Historical conversion data
    const historicalData = {
      total_leads: leads.length,
      total_sales: sales.length,
      conversion_rate: leads.length > 0 ? (sales.length / leads.length) * 100 : 0,
      average_deal_size: sales.length > 0 ? 
        sales.reduce((sum, s) => sum + (s.total_amount || 0), 0) / sales.length : 0
    };

    const prompt = `Você é um especialista em análise preditiva de vendas. Analise os dados do pipeline e forneça uma previsão precisa.

DADOS DO PIPELINE:
${JSON.stringify(pipelineData, null, 2)}

DADOS HISTÓRICOS:
${JSON.stringify(historicalData, null, 2)}

PERÍODO DE PREVISÃO: Próximos ${timeframe} dias

Forneça uma análise completa incluindo:
1. Previsão de vendas (quantidade e valor total)
2. Taxa de conversão esperada por estágio
3. Deals com maior probabilidade de fechar
4. Deals em risco (precisam de atenção)
5. Recomendações para acelerar vendas
6. Projeção de receita (melhor caso, caso base, pior caso)
7. Insights acionáveis para o time de vendas

Use os dados históricos e padrões identificados para fazer previsões realistas.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          forecast_summary: { type: "string" },
          predicted_deals: { type: "number" },
          predicted_revenue: { type: "number" },
          conversion_rates: {
            type: "object",
            properties: {
              lead: { type: "number" },
              qualified: { type: "number" },
              proposal: { type: "number" },
              negotiation: { type: "number" }
            }
          },
          hot_deals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lead_id: { type: "string" },
                probability: { type: "number" },
                reason: { type: "string" }
              }
            }
          },
          at_risk_deals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lead_id: { type: "string" },
                risk_level: { type: "string" },
                reason: { type: "string" },
                action: { type: "string" }
              }
            }
          },
          recommendations: { type: "array", items: { type: "string" } },
          revenue_projection: {
            type: "object",
            properties: {
              best_case: { type: "number" },
              base_case: { type: "number" },
              worst_case: { type: "number" }
            }
          },
          key_insights: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({ success: true, data: response, timeframe });

  } catch (error) {
    console.error('Deal Forecasting Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});