import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data?.customer_id) {
      return Response.json({ error: 'Customer ID required' }, { status: 400 });
    }

    // Update customer last contact date
    await base44.asServiceRole.entities.Customer.update(data.customer_id, {
      last_contact_date: new Date().toISOString()
    });

    // If interaction has next action, create a task
    if (data.next_action && data.next_action_date) {
      const existingTasks = await base44.asServiceRole.entities.Task.filter({
        titulo: data.next_action
      });

      if (existingTasks.length === 0) {
        await base44.asServiceRole.entities.Task.create({
          titulo: data.next_action,
          descricao: `Ação de follow-up para ${data.customer_id}`,
          categoria: 'administrativo',
          prioridade: data.outcome === 'negative' ? 'alta' : 'media',
          status: 'pendente',
          data_vencimento: data.next_action_date
        });
      }
    }

    // Update lead if interaction is with a lead
    const leads = await base44.asServiceRole.entities.Lead.filter({
      email: data.customer_id
    });

    if (leads.length > 0) {
      const lead = leads[0];
      // Trigger lead scoring update
      await base44.asServiceRole.functions.invoke('calculateLeadScore', {
        event: { type: 'update' },
        data: lead
      });
    }

    console.log(`Interaction processed for customer ${data.customer_id}`);

    return Response.json({ 
      success: true,
      message: 'Interaction processed successfully'
    });

  } catch (error) {
    console.error('Error processing interaction:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});