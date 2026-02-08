import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflowData } = await req.json();

    if (!workflowData.name || !workflowData.type || !workflowData.trigger) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create workflow
    const workflow = await base44.entities.AutomationWorkflow.create({
      name: workflowData.name,
      description: workflowData.description || '',
      type: workflowData.type,
      trigger: workflowData.trigger,
      steps: workflowData.steps || [],
      segments: workflowData.segments || [],
      is_active: true,
      contacts_enrolled: 0
    });

    // Award points for creating workflow
    await base44.functions.invoke('awardPoints', {
      action: 'workflow_created',
      metadata: { bonus_multiplier: 2.0 }
    });

    return Response.json({ 
      success: true, 
      data: workflow,
      message: 'Fluxo de nutrição criado! +50 pontos'
    });

  } catch (error) {
    console.error('Create Workflow Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});