import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { patient_name, amount, service, description, success_url, cancel_url } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Valor inválido' }, { status: 400 });
    }

    const amountCents = Math.round(parseFloat(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: service || 'Serviço Odontológico',
            description: description || `Cobrança para ${patient_name}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: success_url || 'https://app.base44.com/success',
      cancel_url: cancel_url || 'https://app.base44.com/cancel',
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        patient_name: patient_name || '',
        service: service || '',
        created_by: user.email,
      },
    });

    console.info(`Stripe session created: ${session.id} for ${patient_name} - R$${amount}`);
    return Response.json({ session_id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});