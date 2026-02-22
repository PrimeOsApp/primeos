import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { description, amount, patient_name, patient_email, notes, transaction_id } = await req.json();

    if (!description || !amount) {
      return Response.json({ error: 'description e amount são obrigatórios' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: description,
            description: notes || undefined,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: patient_email || undefined,
      success_url: `${req.headers.get('origin') || 'https://app.base44.com'}/payment-success`,
      cancel_url: `${req.headers.get('origin') || 'https://app.base44.com'}/payment-cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        patient_name: patient_name || '',
        transaction_id: transaction_id || '',
      },
    });

    // Update transaction with stripe link if transaction_id provided
    if (transaction_id) {
      await base44.asServiceRole.entities.FinancialTransaction.update(transaction_id, {
        stripe_payment_link: session.url,
        stripe_session_id: session.id,
      });
    }

    console.log('Checkout session created:', session.id, 'for', patient_name, 'amount:', amount);

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createDigitalInvoice error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});