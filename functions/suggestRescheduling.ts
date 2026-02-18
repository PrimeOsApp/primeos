import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { patientId, appointmentId } = await req.json();

  const [appointments, patientRecords] = await Promise.all([
    base44.entities.Appointment.list('-date', 200),
    patientId ? base44.entities.PatientRecord.filter({ id: patientId }) : Promise.resolve([])
  ]);

  const patient = patientRecords[0];
  const patientAppointments = appointments.filter(a =>
    a.patient_id === patientId || a.patient_name === (patient?.patient_name)
  );
  const currentAppointment = appointmentId ? appointments.find(a => a.id === appointmentId) : null;

  // Build occupied slots for next 14 days
  const today = new Date();
  const occupiedSlots = {};
  appointments.forEach(a => {
    if (a.status === 'cancelled') return;
    const key = a.date;
    if (!occupiedSlots[key]) occupiedSlots[key] = [];
    occupiedSlots[key].push(a.time);
  });

  // Patient visit pattern analysis
  const completedVisits = patientAppointments.filter(a => a.status === 'completed');
  const noShows = patientAppointments.filter(a => a.status === 'no_show').length;
  const preferredTimes = completedVisits.map(a => a.time).filter(Boolean);
  const preferredServices = completedVisits.map(a => a.service_type).filter(Boolean);

  const prompt = `Você é um assistente de clínica odontológica. Sugira os melhores horários para reagendar uma consulta.

PACIENTE: ${patient?.patient_name || currentAppointment?.patient_name || 'Desconhecido'}
CONSULTA ATUAL: ${currentAppointment ? `${currentAppointment.date} às ${currentAppointment.time} - ${currentAppointment.service_type}` : 'Nova consulta'}
HISTÓRICO DO PACIENTE:
- Consultas realizadas: ${completedVisits.length}
- Faltas/no-shows: ${noShows}
- Horários frequentes: ${preferredTimes.slice(0, 5).join(', ') || 'nenhum histórico'}
- Serviços realizados: ${[...new Set(preferredServices)].join(', ') || 'nenhum'}
- Condições médicas: ${(patient?.medical_conditions || []).join(', ') || 'nenhuma'}

HORÁRIOS JÁ OCUPADOS NOS PRÓXIMOS DIAS:
${Object.entries(occupiedSlots).slice(0, 7).map(([date, times]) => `${date}: ${times.join(', ')}`).join('\n') || 'agenda vazia'}

DATA ATUAL: ${today.toISOString().split('T')[0]}

Sugira 4 slots ideais para reagendamento nos próximos 14 dias. Considere o padrão de visitas do paciente, evite horários ocupados, prefira horários com menor risco de no-show com base no histórico.

Retorne APENAS este JSON:
{
  "suggestions": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "day_of_week": "string (ex: Segunda-feira)",
      "reason": "string (por que este horário é ideal)",
      "confidence": number (0-100)
    }
  ],
  "patient_insight": "string (insight sobre padrão de comportamento do paciente)",
  "risk_note": "string (se há risco de no-show, como mitigar)"
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        suggestions: { type: "array", items: { type: "object" } },
        patient_insight: { type: "string" },
        risk_note: { type: "string" }
      }
    }
  });

  return Response.json(result);
});