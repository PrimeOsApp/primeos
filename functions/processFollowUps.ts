import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (service role) and manual admin calls
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch (_) {
      // Called from scheduled automation - use service role
      isAdmin = true;
    }

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = base44.asServiceRole;

    // Load all active rules, appointments, transactions, patients
    const [rules, appointments, transactions, patients] = await Promise.all([
      db.entities.FollowUpRule.filter({ is_active: true }),
      db.entities.Appointment.list('-date', 500),
      db.entities.FinancialTransaction.filter({ type: 'receita' }, '-date', 500),
      db.entities.PatientRecord.list('-created_date', 500),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = { sent: 0, skipped: 0, failed: 0, details: [] };

    // Load recent logs to avoid duplicate sends (last 7 days)
    const recentLogs = await db.entities.FollowUpLog.list('-created_date', 1000);
    const sentKeys = new Set(recentLogs.map(l => `${l.rule_id}:${l.reference_id}`));

    for (const rule of rules) {
      const offset = rule.days_offset || 0;

      if (rule.trigger === 'appointment_reminder') {
        // Find appointments happening in `offset` days from now
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + Math.abs(offset));
        const targetStr = targetDate.toISOString().split('T')[0];

        const targets = appointments.filter(a =>
          a.date === targetStr &&
          a.status !== 'cancelled' &&
          a.status !== 'completed' &&
          a.patient_email
        );

        for (const appt of targets) {
          const key = `${rule.id}:${appt.id}`;
          if (sentKeys.has(key)) { results.skipped++; continue; }

          const msg = buildMessage(rule.message_template, {
            nome: appt.patient_name,
            data: formatDate(appt.date),
            hora: appt.time || '',
            servico: appt.service_type?.replace(/_/g, ' ') || '',
          });

          const sent = await sendEmail(db, appt.patient_email, rule.subject || 'Lembrete de Consulta - Prime Odontologia', msg);
          await logSend(db, rule, appt.patient_name, appt.patient_email, appt.patient_phone, msg, sent ? 'sent' : 'failed', appt.id);
          sent ? results.sent++ : results.failed++;
          results.details.push({ patient: appt.patient_name, trigger: rule.trigger, status: sent ? 'sent' : 'failed' });
        }

      } else if (rule.trigger === 'post_consultation') {
        // Find appointments completed `offset` days ago
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - Math.abs(offset));
        const targetStr = targetDate.toISOString().split('T')[0];

        const targets = appointments.filter(a =>
          a.date === targetStr &&
          a.status === 'completed' &&
          a.patient_email
        );

        for (const appt of targets) {
          const key = `${rule.id}:${appt.id}`;
          if (sentKeys.has(key)) { results.skipped++; continue; }

          const msg = buildMessage(rule.message_template, {
            nome: appt.patient_name,
            data: formatDate(appt.date),
            hora: appt.time || '',
            servico: appt.service_type?.replace(/_/g, ' ') || '',
          });

          const sent = await sendEmail(db, appt.patient_email, rule.subject || 'Como foi sua consulta? - Prime Odontologia', msg);
          await logSend(db, rule, appt.patient_name, appt.patient_email, appt.patient_phone, msg, sent ? 'sent' : 'failed', appt.id);
          sent ? results.sent++ : results.failed++;
          results.details.push({ patient: appt.patient_name, trigger: rule.trigger, status: sent ? 'sent' : 'failed' });
        }

      } else if (rule.trigger === 'overdue_payment') {
        // Find pending/overdue transactions past due date by `offset` days
        const targets = transactions.filter(t => {
          if (!t.due_date || !t.patient_email) return false;
          if (t.status !== 'pendente' && t.status !== 'vencido') return false;
          const due = new Date(t.due_date);
          due.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((today - due) / (1000 * 60 * 60 * 24));
          return diffDays === Math.abs(offset);
        });

        for (const tx of targets) {
          const key = `${rule.id}:${tx.id}`;
          if (sentKeys.has(key)) { results.skipped++; continue; }

          const msg = buildMessage(rule.message_template, {
            nome: tx.patient_name,
            valor: `R$ ${tx.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            data: formatDate(tx.due_date),
            servico: tx.description || '',
          });

          const sent = await sendEmail(db, tx.patient_email, rule.subject || 'Pagamento Pendente - Prime Odontologia', msg);
          await logSend(db, rule, tx.patient_name, tx.patient_email, null, msg, sent ? 'sent' : 'failed', tx.id);
          sent ? results.sent++ : results.failed++;
          results.details.push({ patient: tx.patient_name, trigger: rule.trigger, status: sent ? 'sent' : 'failed' });
        }

      } else if (rule.trigger === 'inactive_patient') {
        // Patients with no appointment in last `offset` days
        const cutoff = new Date(today);
        cutoff.setDate(today.getDate() - Math.abs(offset));
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const activePatientIds = new Set(
          appointments
            .filter(a => a.date >= cutoffStr)
            .map(a => a.patient_id || a.patient_name)
        );

        const inactivePatients = patients.filter(p =>
          p.patient_email &&
          !activePatientIds.has(p.id) &&
          !activePatientIds.has(p.patient_name)
        );

        // Only process a batch per run to avoid spam
        for (const patient of inactivePatients.slice(0, 20)) {
          const key = `${rule.id}:${patient.id}`;
          if (sentKeys.has(key)) { results.skipped++; continue; }

          const msg = buildMessage(rule.message_template, {
            nome: patient.patient_name,
            data: formatDate(today.toISOString()),
          });

          const sent = await sendEmail(db, patient.patient_email, rule.subject || 'Sentimos sua falta! - Prime Odontologia', msg);
          await logSend(db, rule, patient.patient_name, patient.patient_email, patient.patient_phone, msg, sent ? 'sent' : 'failed', patient.id);
          sent ? results.sent++ : results.failed++;
          results.details.push({ patient: patient.patient_name, trigger: rule.trigger, status: sent ? 'sent' : 'failed' });
        }
      }

      // Update rule last_run and total_sent
      await db.entities.FollowUpRule.update(rule.id, {
        last_run: new Date().toISOString(),
        total_sent: (rule.total_sent || 0) + results.sent,
      });
    }

    console.log('Follow-up run complete:', results);
    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('processFollowUps error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildMessage(template, vars) {
  let msg = template;
  for (const [key, val] of Object.entries(vars)) {
    msg = msg.replaceAll(`{${key}}`, val || '');
  }
  return msg;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
}

async function sendEmail(db, to, subject, body) {
  try {
    await db.integrations.Core.SendEmail({
      to,
      subject,
      body: body.replace(/\n/g, '<br>'),
      from_name: 'Prime Odontologia',
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', to, err.message);
    return false;
  }
}

async function logSend(db, rule, patientName, patientEmail, patientPhone, msg, status, referenceId) {
  try {
    await db.entities.FollowUpLog.create({
      rule_id: rule.id,
      rule_name: rule.name,
      patient_name: patientName,
      patient_email: patientEmail || '',
      patient_phone: patientPhone || '',
      trigger: rule.trigger,
      channel: rule.channel || 'email',
      message_sent: msg.slice(0, 500),
      status,
      reference_id: referenceId,
    });
  } catch (err) {
    console.error('Log failed:', err.message);
  }
}