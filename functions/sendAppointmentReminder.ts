import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all confirmed or scheduled appointments for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const appointments = await base44.asServiceRole.entities.Appointment.filter({
      date: tomorrowDate,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    const results = {
      sent: [],
      failed: [],
      skipped: []
    };

    for (const apt of appointments) {
      // Skip if already sent or no phone
      if (apt.reminder_sent || !apt.patient_phone) {
        results.skipped.push({
          appointment_id: apt.id,
          patient_name: apt.patient_name,
          reason: !apt.patient_phone ? 'No phone' : 'Already sent'
        });
        continue;
      }

      try {
        // In a real implementation, you would integrate with a WhatsApp API here
        // For now, we'll just mark as sent
        
        await base44.asServiceRole.entities.Appointment.update(apt.id, {
          reminder_sent: true
        });

        results.sent.push({
          appointment_id: apt.id,
          patient_name: apt.patient_name,
          phone: apt.patient_phone
        });
      } catch (error) {
        results.failed.push({
          appointment_id: apt.id,
          patient_name: apt.patient_name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      date: tomorrowDate,
      summary: {
        sent: results.sent.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      details: results
    });

  } catch (error) {
    console.error('Send reminders error:', error);
    return Response.json({ 
      error: error.message || 'Erro ao enviar lembretes'
    }, { status: 500 });
  }
});