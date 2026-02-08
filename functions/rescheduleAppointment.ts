import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { appointment_id, new_date, new_time, reason } = await req.json();

    if (!appointment_id || !new_date || !new_time) {
      return Response.json({ 
        success: false,
        error: 'Dados incompletos' 
      }, { status: 400 });
    }

    // Get the existing appointment
    const existingAppointment = await base44.asServiceRole.entities.Appointment.get('Appointment', appointment_id);

    if (!existingAppointment) {
      return Response.json({
        success: false,
        error: 'Agendamento não encontrado'
      }, { status: 404 });
    }

    // Check if new time slot is available
    const conflictingAppointments = await base44.asServiceRole.entities.Appointment.filter({
      date: new_date,
      time: new_time,
      status: { $ne: 'cancelled' }
    });

    if (conflictingAppointments.some(apt => apt.id !== appointment_id)) {
      return Response.json({
        success: false,
        error: 'Este horário não está disponível. Por favor, escolha outro.'
      });
    }

    // Update the appointment
    const updatedAppointment = await base44.asServiceRole.entities.Appointment.update(appointment_id, {
      date: new_date,
      time: new_time,
      status: 'scheduled',
      notes: `${existingAppointment.notes || ''}\n\n[REAGENDADO] ${reason || 'Sem motivo especificado'} - ${new Date().toISOString()}`
    });

    // Send notification
    const message = `
🔄 *Consulta Reagendada*

Olá ${existingAppointment.patient_name}!

Sua consulta foi reagendada:

📅 *Nova Data:* ${new_date}
🕐 *Novo Horário:* ${new_time}

${reason ? `📝 *Motivo:* ${reason}` : ''}

Qualquer dúvida, entre em contato.

Até breve! 🦷
    `.trim();

    console.log('WhatsApp notification:', {
      phone: existingAppointment.patient_phone,
      message
    });

    return Response.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Consulta reagendada com sucesso!'
    });

  } catch (error) {
    console.error('Reschedule error:', error);
    return Response.json({ 
      success: false,
      error: 'Erro ao reagendar consulta'
    }, { status: 500 });
  }
});