import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const { message, conversationHistory = [], customerContext } = await req.json();

    // Build context about the customer and business
    const contextPrompt = customerContext ? `
Cliente: ${customerContext.name}
Histórico: ${customerContext.interactions || 0} interações
Status: ${customerContext.status || 'Desconhecido'}
Interesse: ${customerContext.interest || 'Não especificado'}
` : '';

    const systemPrompt = `Você é um assistente virtual da Prime Odontologia, uma clínica premium especializada em Invisalign e estética dental.

ESTILO DE COMUNICAÇÃO:
- Profissional, mas amigável e acessível
- Use linguagem simples e educativa
- Sempre cordial e prestativo
- Mostre empatia e cuidado

VOCÊ PODE AJUDAR COM:
- Informações sobre serviços (Invisalign, estética, clareamento, harmonização)
- Agendamento de avaliações gratuitas
- Perguntas frequentes sobre tratamentos
- Orientações pós-atendimento
- Dúvidas sobre valores e formas de pagamento

SEMPRE:
- Ofereça agendar uma avaliação presencial quando apropriado
- Seja transparente se não souber algo
- Direcione para contato direto com a clínica quando necessário

${contextPrompt}

Responda de forma natural, útil e humanizada.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const response = await primeos.integrations.Core.InvokeLLM({
      prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          intent: { type: "string", enum: ["question", "booking", "complaint", "information", "other"] },
          sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
          requires_human: { type: "boolean" },
          suggested_action: { type: "string" }
        }
      }
    });

    return Response.json({ success: true, data: response });

  } catch (error) {
    console.error('AI Chatbot Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});