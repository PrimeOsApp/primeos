import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    // Allow both admin calls and automated scheduled calls (no user context)
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch (_) {
      // scheduled automation – no user token, allow through
      isAdmin = true;
    }

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse optional payload – can target 'tomorrow' (default) or 'today'
    let targetDay = 'tomorrow';
    try {
      const body = await req.json().catch(() => ({}));
      if (body.day === 'today') targetDay = 'today';
    } catch (_) {}

    const targetDate = new Date();
    if (targetDay === 'tomorrow') targetDate.setDate(targetDate.getDate() + 1);
    const dateStr = targetDate.toISOString().split('T')[0];

    const appointments = await db.entities.Appointment.filter({ date: dateStr });
    const active = appointments.filter(a => ['scheduled','confirmed'].includes(a.status));

    const results = { sent: [], failed: [], skipped: [] };

    for (const apt of active) {
      if (apt.reminder_sent) {
        results.skipped.push({ id: apt.id, name: apt.patient_name, reason: 'Already sent' });
        continue;
      }
      if (!apt.patient_email && !apt.patient_phone) {
        results.skipped.push({ id: apt.id, name: apt.patient_name, reason: 'No contact info' });
        continue;
      }

      try {
        // Send email reminder
        if (apt.patient_email) {
          const label = targetDay === 'tomorrow' ? 'AMANHÃ' : 'HOJE';
          await db.integrations.Core.SendEmail({
            to: apt.patient_email,
            from_name: 'Prime Odontologia',
            subject: `🔔 Lembrete: Sua consulta é ${label} - ${apt.time}`,
            body: `
              <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
                <h2 style="color:#4f46e5;margin-top:0">Lembrete de Consulta 🦷</h2>
                <p>Olá <strong>${apt.patient_name}</strong>,</p>
                <p>Sua consulta na <strong>Prime Odontologia</strong> é <strong>${label}</strong>:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Data</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${formatDate(apt.date)}</td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Horário</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${apt.time}</td></tr>
                  ${apt.provider ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Profissional</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${apt.provider}</td></tr>` : ''}
                  ${apt.resource_name ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Local</td><td style="padding:8px 0;font-weight:600">${apt.resource_name}</td></tr>` : ''}
                </table>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;font-size:13px;color:#166534;margin-bottom:16px">
                  ✅ Em caso de cancelamento, por favor entre em contato com pelo menos <strong>24h de antecedência</strong>.
                </div>
                <p style="color:#94a3b8;font-size:12px">Prime Odontologia · Obrigado pela preferência!</p>
              </div>
            `
          });
        }

        await db.entities.Appointment.update(apt.id, { reminder_sent: true });
        results.sent.push({ id: apt.id, name: apt.patient_name, email: apt.patient_email, phone: apt.patient_phone });
        console.log(`Reminder sent: ${apt.patient_name} (${dateStr})`);
      } catch (err) {
        console.error(`Reminder failed for ${apt.patient_name}:`, err.message);
        results.failed.push({ id: apt.id, name: apt.patient_name, error: err.message });
      }
    }

    return Response.json({
      success: true,
      date: dateStr,
      target: targetDay,
      summary: { sent: results.sent.length, failed: results.failed.length, skipped: results.skipped.length },
      details: results
    });

  } catch (error) {
    console.error('Reminder function error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}