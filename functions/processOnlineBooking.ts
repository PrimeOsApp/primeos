import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const bookingData = await req.json();

    // Validate required fields
    if (!bookingData.patient_name || !bookingData.patient_phone || !bookingData.date || !bookingData.time) {
      return Response.json({ 
        success: false,
        error: 'Dados incompletos' 
      }, { status: 400 });
    }

    // Check if time slot is still available
    const existingAppointments = await base44.asServiceRole.entities.Appointment.filter({
      date: bookingData.date,
      time: bookingData.time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointments.length > 0) {
      return Response.json({
        success: false,
        error: 'Este horário não está mais disponível. Por favor, escolha outro.'
      });
    }

    // Create the appointment
    const appointment = await base44.asServiceRole.entities.Appointment.create({
      patient_name: bookingData.patient_name,
      patient_phone: bookingData.patient_phone,
      service_type: bookingData.service_type || 'consultation',
      date: bookingData.date,
      time: bookingData.time,
      duration_minutes: bookingData.duration_minutes || 30,
      status: 'scheduled',
      notes: bookingData.notes || '',
      reminder_sent: false
    });

    // Send confirmation message
    const confirmationMessage = `
✅ *Agendamento Confirmado!*

📋 *Detalhes da Consulta:*
👤 Paciente: ${bookingData.patient_name}
📅 Data: ${bookingData.date}
🕐 Horário: ${bookingData.time}
⏱️ Duração: ${bookingData.duration_minutes} minutos

📍 Endereço da clínica será enviado posteriormente.

⚠️ *Importante:*
- Chegue 10 minutos antes
- Traga documento com foto
- Em caso de cancelamento, avise com 24h de antecedência

Para reagendar, responda esta mensagem.

Até breve! 🦷
    `.trim();

    // Send email if provided
    if (bookingData.patient_email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: bookingData.patient_email,
          subject: '✅ Consulta Agendada - Prime Odontologia',
          body: `
            <h2>Agendamento Confirmado!</h2>
            <p>Olá ${bookingData.patient_name},</p>
            <p>Sua consulta foi agendada com sucesso!</p>
            <hr>
            <p><strong>Data:</strong> ${bookingData.date}</p>
            <p><strong>Horário:</strong> ${bookingData.time}</p>
            <p><strong>Duração:</strong> ${bookingData.duration_minutes} minutos</p>
            <hr>
            <p><strong>Observações importantes:</strong></p>
            <ul>
              <li>Chegue 10 minutos antes do horário agendado</li>
              <li>Traga documento com foto</li>
              <li>Em caso de cancelamento, avise com 24 horas de antecedência</li>
            </ul>
            <p>Qualquer dúvida, entre em contato conosco.</p>
            <p>Até breve! 🦷</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue even if email fails
      }
    }

    // In a real implementation, you would send WhatsApp message here
    // For now, we just log it
    console.log('WhatsApp message to send:', {
      phone: bookingData.patient_phone,
      message: confirmationMessage
    });

    return Response.json({
      success: true,
      appointment_id: appointment.id,
      message: 'Agendamento realizado com sucesso! Você receberá uma confirmação em breve.'
    });

  } catch (error) {
    console.error('Booking error:', error);
    return Response.json({ 
      success: false,
      error: 'Erro ao processar agendamento. Tente novamente.'
    }, { status: 500 });
  }
});