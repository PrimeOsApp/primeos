import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data?.id) {
      return Response.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Calculate lead score based on multiple factors
    let score = 0;

    // Source scoring (40 points max)
    const sourceScores = {
      referral: 40,
      website: 30,
      social_media: 25,
      whatsapp: 35,
      cold_outreach: 15,
      other: 10
    };
    score += sourceScores[data.source] || 10;

    // Status scoring (30 points max)
    const statusScores = {
      qualified: 30,
      contacted: 20,
      new: 10,
      lost: 0
    };
    score += statusScores[data.status] || 10;

    // Interest level scoring (30 points max)
    const interestScores = {
      high: 30,
      medium: 20,
      low: 10
    };
    score += interestScores[data.interest_level] || 15;

    // Get interactions count for this lead
    const interactions = await base44.asServiceRole.entities.LeadInteraction.filter({
      lead_id: data.id
    });
    
    // Engagement bonus (interactions + notes)
    const engagementBonus = Math.min(interactions.length * 5, 20);
    score += engagementBonus;

    // Notes bonus
    if (data.notes && data.notes.length > 50) {
      score += 10;
    }

    // Update lead with calculated score
    await base44.asServiceRole.entities.Lead.update(data.id, {
      score: Math.min(score, 100),
      last_score_update: new Date().toISOString()
    });

    console.log(`Lead ${data.id} score updated to ${score}`);

    // Check if score crosses threshold for task creation
    if (score >= 70 && data.status !== 'lost') {
      // Create high-priority task for sales team
      await base44.asServiceRole.functions.invoke('createSalesTask', {
        leadId: data.id,
        leadName: data.name,
        leadEmail: data.email,
        leadPhone: data.phone,
        score: score,
        priority: score >= 85 ? 'critical' : 'high'
      });
    }

    return Response.json({ 
      success: true, 
      score,
      message: `Lead score calculated: ${score}/100`
    });

  } catch (error) {
    console.error('Error calculating lead score:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});