import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, Clock, User, Plus, ChevronLeft, ChevronRight,
  MessageCircle, CheckCircle, X, AlertCircle, Loader2, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import GoogleCalendarSync from "../components/calendar/GoogleCalendarSync";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

const serviceTypes = {
  consultation: { label: "Consulta", color: "bg-blue-500", duration: 30 },
  follow_up: { label: "Retorno", color: "bg-green-500", duration: 20 },
  procedure: { label: "Procedimento", color: "bg-purple-500", duration: 60 },
  checkup: { label: "Check-up", color: "bg-teal-500", duration: 45 },
  emergency: { label: "Emergência", color: "bg-red-500", duration: 30 },
  therapy: { label: "Terapia", color: "bg-amber-500", duration: 60 },
  diagnostic: { label: "Diagnóstico", color: "bg-indigo-500", duration: 30 }
};

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-rose-100 text-rose-700"
};

export default function Agenda() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => base44.entities.Appointment.list("-date")
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list()
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAppointments"] });
      setShowForm(false);
      toast.success("Consulta agendada!");
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allAppointments"] })
  });

  const [form, setForm] = useState({
    patient_id: "", patient_name: "", patient_phone: "",
    service_type: "consultation", date: "", time: "",
    duration_minutes: 30, provider: "", notes: ""
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getAppointmentsForDateAndTime = (date, time) => {
    return appointments.filter(apt => 
      apt.date === format(date, "yyyy-MM-dd") && apt.time === time
    );
  };

  const openWhatsApp = (phone, message) => {
    const cleanPhone = phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Agenda
              </h1>
              <p className="text-slate-500 mt-1">Prime Odontologia - Agendamento de consultas</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />Nova Consulta
            </Button>
          </div>
        </motion.div>

        {/* Google Calendar Sync */}
        <div className="mb-6">
          <GoogleCalendarSync />
        </div>

        {/* Week Navigation */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(currentWeek, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <Button variant="ghost" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayAppointments = appointments.filter(apt => apt.date === format(day, "yyyy-MM-dd"));
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "p-3 rounded-xl text-center transition-all",
                      isSelected ? "bg-blue-600 text-white" : isToday ? "bg-blue-100" : "bg-slate-50 hover:bg-slate-100"
                    )}
                  >
                    <p className="text-xs uppercase">{format(day, "EEE", { locale: ptBR })}</p>
                    <p className="text-lg font-bold">{format(day, "d")}</p>
                    {dayAppointments.length > 0 && (
                      <Badge className={cn("mt-1 text-xs", isSelected ? "bg-white/20" : "bg-blue-100 text-blue-700")}>
                        {dayAppointments.length}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Schedule */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {timeSlots.map((time) => {
                  const slotAppointments = getAppointmentsForDateAndTime(selectedDate, time);
                  return (
                    <div key={time} className="flex items-stretch gap-4">
                      <div className="w-16 py-3 text-sm font-medium text-slate-500">{time}</div>
                      <div className="flex-1 min-h-[60px] border-l-2 border-slate-100 pl-4">
                        {slotAppointments.length > 0 ? (
                          <div className="space-y-2">
                            {slotAppointments.map((apt) => (
                              <div
                                key={apt.id}
                                className={cn(
                                  "p-3 rounded-lg border-l-4",
                                  serviceTypes[apt.service_type]?.color.replace("bg-", "border-"),
                                  "bg-white shadow-sm"
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{apt.patient_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={cn("text-xs", statusColors[apt.status])}>{apt.status}</Badge>
                                      <span className="text-xs text-slate-500">{serviceTypes[apt.service_type]?.label}</span>
                                      <span className="text-xs text-slate-400">{apt.duration_minutes}min</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    {apt.patient_phone && (
                                      <Button size="sm" variant="ghost" onClick={() => {
                                        const msg = `Olá ${apt.patient_name}! 👋 Lembrando da sua consulta amanhã às ${apt.time}. Confirma presença? ✅`;
                                        openWhatsApp(apt.patient_phone, msg);
                                      }}>
                                        <MessageCircle className="w-4 h-4 text-green-600" />
                                      </Button>
                                    )}
                                    {apt.status === "scheduled" && (
                                      <Button size="sm" variant="ghost" onClick={() => {
                                        updateAppointmentMutation.mutate({ id: apt.id, data: { ...apt, status: "confirmed" } });
                                      }}>
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      </Button>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => {
                                      updateAppointmentMutation.mutate({ id: apt.id, data: { ...apt, status: "cancelled" } });
                                    }}>
                                      <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSlot({ date: format(selectedDate, "yyyy-MM-dd"), time });
                              setForm(prev => ({ ...prev, date: format(selectedDate, "yyyy-MM-dd"), time }));
                              setShowForm(true);
                            }}
                            className="w-full h-full min-h-[50px] border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-center text-slate-400 hover:text-blue-500"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            <span className="text-sm">Agendar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Appointment Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Consulta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Paciente</Label>
                <Select value={form.patient_id} onValueChange={handlePatientSelect}>
                  <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Serviço</Label>
                  <Select value={form.service_type} onValueChange={(v) => setForm({...form, service_type: v, duration_minutes: serviceTypes[v]?.duration || 30})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(serviceTypes).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duração (min)</Label>
                  <Select value={String(form.duration_minutes)} onValueChange={(v) => setForm({...form, duration_minutes: parseInt(v)})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data</Label><Input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} /></div>
                <div>
                  <Label>Horário</Label>
                  <Select value={form.time} onValueChange={(v) => setForm({...form, time: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Dentista</Label><Input value={form.provider} onChange={(e) => setForm({...form, provider: e.target.value})} placeholder="Nome do profissional" /></div>
              <Button
                onClick={() => {
                  createAppointmentMutation.mutate({
                    ...form,
                    status: "scheduled"
                  });
                  if (form.patient_phone) {
                    const msg = `Olá ${form.patient_name}! 🦷\n\nSua consulta na Prime Odontologia foi agendada:\n📅 ${form.date}\n⏰ ${form.time}\n📋 ${serviceTypes[form.service_type]?.label}\n\nConfirme respondendo SIM. 👍`;
                    openWhatsApp(form.patient_phone, msg);
                  }
                }}
                disabled={!form.patient_name || !form.date || !form.time || createAppointmentMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createAppointmentMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Agendar e Notificar via WhatsApp
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}