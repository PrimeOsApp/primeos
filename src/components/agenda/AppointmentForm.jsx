import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Loader2 } from "lucide-react";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

const serviceTypes = {
  consultation: { label: "Consulta", duration: 30 },
  follow_up: { label: "Retorno", duration: 20 },
  procedure: { label: "Procedimento", duration: 60 },
  checkup: { label: "Check-up", duration: 45 },
  emergency: { label: "Emergência", duration: 30 },
  therapy: { label: "Terapia", duration: 60 },
  diagnostic: { label: "Diagnóstico", duration: 30 }
};

export default function AppointmentForm({ 
  appointment = null, 
  patients = [], 
  onSubmit, 
  onCancel,
  isLoading = false,
  initialDate = "",
  initialTime = ""
}) {
  const [form, setForm] = useState({
    patient_id: "",
    patient_name: "",
    patient_phone: "",
    service_type: "consultation",
    date: initialDate,
    time: initialTime,
    duration_minutes: 30,
    provider: "",
    notes: "",
    status: "scheduled",
    follow_up_required: false,
    follow_up_days: 7,
    follow_up_notes: ""
  });

  useEffect(() => {
    if (appointment) {
      setForm(appointment);
    }
  }, [appointment]);

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setForm(prev => ({
        ...prev,
        patient_id: patient.id,
        patient_name: patient.name,
        patient_phone: patient.phone || ""
      }));
    }
  };

  const handleServiceTypeChange = (serviceType) => {
    setForm(prev => ({
      ...prev,
      service_type: serviceType,
      duration_minutes: serviceTypes[serviceType]?.duration || 30
    }));
  };

  const handleSubmit = () => {
    if (!form.patient_name || !form.date || !form.time) return;
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Paciente *</Label>
        <Select value={form.patient_id} onValueChange={handlePatientSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o paciente" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Serviço *</Label>
          <Select value={form.service_type} onValueChange={handleServiceTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(serviceTypes).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  {val.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Duração (minutos) *</Label>
          <Select 
            value={String(form.duration_minutes)} 
            onValueChange={(v) => setForm({...form, duration_minutes: parseInt(v)})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="20">20 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
              <SelectItem value="90">90 min</SelectItem>
              <SelectItem value="120">120 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Data *</Label>
          <Input 
            type="date" 
            value={form.date} 
            onChange={(e) => setForm({...form, date: e.target.value})} 
          />
        </div>
        
        <div>
          <Label>Horário *</Label>
          <Select value={form.time} onValueChange={(v) => setForm({...form, time: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Dentista</Label>
        <Input 
          value={form.provider} 
          onChange={(e) => setForm({...form, provider: e.target.value})} 
          placeholder="Nome do profissional"
        />
      </div>

      {appointment && (
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="no_show">Não Compareceu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Observações</Label>
        <Textarea 
          value={form.notes} 
          onChange={(e) => setForm({...form, notes: e.target.value})} 
          placeholder="Informações adicionais sobre a consulta"
          rows={3}
        />
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="follow_up" 
            checked={form.follow_up_required}
            onCheckedChange={(checked) => setForm({...form, follow_up_required: checked})}
          />
          <Label htmlFor="follow_up" className="font-medium cursor-pointer">
            Agendar follow-up automático após consulta
          </Label>
        </div>

        {form.follow_up_required && (
          <div className="pl-6 space-y-3 bg-blue-50 p-4 rounded-lg">
            <div>
              <Label>Retorno em quantos dias?</Label>
              <Select 
                value={String(form.follow_up_days)} 
                onValueChange={(v) => setForm({...form, follow_up_days: parseInt(v)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="7">7 dias (1 semana)</SelectItem>
                  <SelectItem value="15">15 dias (2 semanas)</SelectItem>
                  <SelectItem value="30">30 dias (1 mês)</SelectItem>
                  <SelectItem value="45">45 dias</SelectItem>
                  <SelectItem value="60">60 dias (2 meses)</SelectItem>
                  <SelectItem value="90">90 dias (3 meses)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações do follow-up</Label>
              <Textarea 
                value={form.follow_up_notes} 
                onChange={(e) => setForm({...form, follow_up_notes: e.target.value})} 
                placeholder="Instruções para o retorno (ex: trazer exames, verificar cicatrização)"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!form.patient_name || !form.date || !form.time || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {appointment ? "Atualizar" : "Agendar"}
        </Button>
        
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outline"
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}