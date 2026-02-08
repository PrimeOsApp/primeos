import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentType, platform, audience, objective, context, performanceData } = await req.json();

    let prompt = '';
    let responseSchema = {};

    if (contentType === 'ad_copy') {
      prompt = `Você é um expert em copywriting para anúncios digitais.

Crie 5 variações de copy para anúncios de ${platform || 'Google/Facebook Ads'}.

PÚBLICO-ALVO: ${audience || 'Público geral'}
OBJETIVO: ${objective || 'Gerar conversões'}
CONTEXTO DO NEGÓCIO: ${context || 'Negócio em crescimento'}

${performanceData ? `DADOS DE PERFORMANCE ANTERIOR:
- Métricas: ${JSON.stringify(performanceData)}
- Use esses dados para otimizar as variações` : ''}

Para cada variação, forneça:
1. Título chamativo (máx 30 caracteres)
2. Copy principal (máx 90 caracteres)
3. Call-to-action forte
4. Razão da estratégia usada

Foque em gatilhos mentais, benefícios claros e senso de urgência.`;

      responseSchema = {
        type: "object",
        properties: {
          variations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
                strategy: { type: "string" }
              }
            }
          }
        }
      };
    } else if (contentType === 'social_media') {
      prompt = `Você é um especialista em marketing de conteúdo para redes sociais.

Baseado nos dados de performance, sugira 5 ideias de posts para redes sociais.

PLATAFORMA: ${platform || 'Instagram/Facebook'}
PÚBLICO-ALVO: ${audience || 'Público geral'}
CONTEXTO: ${context || 'Engajamento e conversão'}

${performanceData ? `DADOS DE PERFORMANCE:
${JSON.stringify(performanceData, null, 2)}

Analise o que funcionou melhor e sugira conteúdos similares.` : ''}

Para cada ideia, forneça:
1. Tipo de post (carrossel, vídeo, imagem única, etc)
2. Tema/assunto
3. Copy sugerido (com emojis)
4. Hashtags relevantes
5. Melhor horário para postar
6. Objetivo esperado`;

      responseSchema = {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                theme: { type: "string" },
                copy: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                bestTime: { type: "string" },
                objective: { type: "string" }
              }
            }
          }
        }
      };
    } else if (contentType === 'email_sequence') {
      prompt = `Você é um expert em email marketing e automação.

Crie uma sequência de 5 emails para nutrição de leads.

PÚBLICO: ${audience || 'Leads novos'}
OBJETIVO: ${objective || 'Conversão e engajamento'}
CONTEXTO: ${context || 'Jornada do cliente'}

Para cada email, forneça:
1. Assunto cativante
2. Preview text
3. Corpo do email (HTML friendly, máx 200 palavras)
4. Call-to-action
5. Timing ideal (ex: "Dia 1", "Dia 3", etc)
6. Objetivo específico desse email

Mantenha tom conversacional, pessoal e focado em valor.`;

      responseSchema = {
        type: "object",
        properties: {
          sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                subject: { type: "string" },
                previewText: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
                timing: { type: "string" },
                objective: { type: "string" }
              }
            }
          }
        }
      };
    } else {
      return Response.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseSchema
    });

    return Response.json({ 
      success: true, 
      content: result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate marketing content'
    }, { status: 500 });
  }
});