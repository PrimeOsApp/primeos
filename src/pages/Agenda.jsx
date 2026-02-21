import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar, Plus, ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Bell, Brain,
  Users, MonitorCheck, BellRing, DollarSign
} from "lucide-react";
import AIReturnSuggestions from "../components/agenda/AIReturnSuggestions";
import { toast } from "sonner";
import { format, startOfWeek, addWeeks, addMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import GoogleCalendarSync from "../components/calendar/GoogleCalendarSync";
import MonthView from "../components/agenda/MonthView";
import WeekView from "../components/agenda/WeekView";
import DayView from "../components/agenda/DayView";
import AppointmentForm from "../components/agenda/AppointmentForm";
import DentistAvailability from "../components/agenda/DentistAvailability";
import ResourceManager from "../components/agenda/ResourceManager";
import ReminderPanel from "../components/agenda/ReminderPanel";
import ReminderScheduleManager from "../components/agenda/ReminderScheduleManager";
import RevenuePanel from "../components/agenda/RevenuePanel";

export default function Agenda() {
  const [view, setView] = useState("day");
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [initialDate, setInitialDate] = useState("");
  const [initialTime, setInitialTime] = useState("");
  
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
    mutationFn: async (data) => {
      const appointment = await base44.entities.Appointment.create(data);
      
      // Send WhatsApp notification
      if (data.patient_phone) {
        const msg = `Olá ${data.patient_name}! 🦷\n\nSua consulta na Prime Odontologia foi agendada:\n📅 ${data.date}\n⏰ ${data.time}\n\nConfirme respondendo SIM. 👍`;
        const cleanPhone = data.patient_phone.replace(/\D/g, "");
        window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
      }
      
      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAppointments"] });
      setShowForm(false);
      setEditingAppointment(null);
      toast.success("Consulta agendada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao agendar consulta");
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAppointments"] });
      setShowForm(false);
      setEditingAppointment(null);
      toast.success("Consulta atualizada!");
    }
  });

  const sendRemindersMutation = useMutation({
    mutationFn: () => base44.functions.invoke('sendAppointmentReminder', {}),
    onSuccess: (response) => {
      const data = response.data;
      toast.success(`Lembretes enviados: ${data.summary.sent} enviados, ${data.summary.skipped} ignorados`);
    },
    onError: () => {
      toast.error("Erro ao enviar lembretes");
    }
  });

  const handleSlotClick = (date, time) => {
    setInitialDate(date);
    setInitialTime(time);
    setEditingAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setInitialDate("");
    setInitialTime("");
    setShowForm(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingAppointment) {
      updateAppointmentMutation.mutate({
        id: editingAppointment.id,
        data: formData
      });
    } else {
      createAppointmentMutation.mutate(formData);
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (apt) {
      updateAppointmentMutation.mutate({
        id: appointmentId,
        data: { ...apt, status: newStatus }
      });
      toast.success("Status atualizado!");
    }
  };

  const handleCancelAppointment = (appointment) => {
    if (confirm(`Deseja cancelar a consulta de ${appointment.patient_name}?`)) {
      updateAppointmentMutation.mutate({
        id: appointment.id,
        data: { ...appointment, status: "cancelled" }
      });
    }
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setView("day");
  };

  const [mainTab, setMainTab] = useState("calendar");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Agenda de Consultas
              </h1>
              <p className="text-slate-500 mt-1">Gerencie agendamentos, profissionais e recursos</p>
            </div>
            <Button onClick={() => {
              setEditingAppointment(null);
              setInitialDate("");
              setInitialTime("");
              setShowForm(true);
            }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />Nova Consulta
            </Button>
          </div>
        </motion.div>

        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-5">
          <TabsList className="flex w-full max-w-xl h-auto gap-1">
            <TabsTrigger value="calendar" className="flex items-center gap-1.5 flex-1">
              <Calendar className="w-4 h-4" />Agenda
            </TabsTrigger>
            <TabsTrigger value="lembretes" className="flex items-center gap-1.5 flex-1">
              <BellRing className="w-4 h-4" />Lembretes
            </TabsTrigger>
            <TabsTrigger value="config_lembretes" className="flex items-center gap-1.5 flex-1">
              <Bell className="w-4 h-4" />Configurar
            </TabsTrigger>
            <TabsTrigger value="profissionais" className="flex items-center gap-1.5 flex-1">
              <Users className="w-4 h-4" />Profissionais
            </TabsTrigger>
            <TabsTrigger value="recursos" className="flex items-center gap-1.5 flex-1">
              <MonitorCheck className="w-4 h-4" />Recursos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lembretes">
            <ReminderPanel />
          </TabsContent>

          <TabsContent value="config_lembretes">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <ReminderScheduleManager />
            </div>
          </TabsContent>

          <TabsContent value="profissionais">
            <DentistAvailability />
          </TabsContent>

          <TabsContent value="recursos">
            <ResourceManager />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-5">
            <div>
              <GoogleCalendarSync />
            </div>
            <div>
              <AIReturnSuggestions onSchedule={(prefill) => {
                setEditingAppointment(null);
                setInitialDate(prefill.date || "");
                setInitialTime(prefill.time || "");
                setShowForm(true);
              }} />
            </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <Tabs value={view} onValueChange={setView}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="day" className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Dia
                  </TabsTrigger>
                  <TabsTrigger value="week" className="flex items-center gap-2">
                    <CalendarRange className="w-4 h-4" />
                    Semana
                  </TabsTrigger>
                  <TabsTrigger value="month" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Mês
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      if (view === "month") setCurrentMonth(addMonths(currentMonth, -1));
                      else setCurrentWeek(addWeeks(currentWeek, -1));
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <span className="text-lg font-semibold min-w-[200px] text-center">
                    {view === "month" 
                      ? format(currentMonth, "MMMM yyyy", { locale: ptBR })
                      : view === "week"
                      ? format(currentWeek, "MMMM yyyy", { locale: ptBR })
                      : format(selectedDate, "d 'de' MMMM yyyy", { locale: ptBR })
                    }
                  </span>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      if (view === "month") setCurrentMonth(addMonths(currentMonth, 1));
                      else setCurrentWeek(addWeeks(currentWeek, 1));
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <TabsContent value="day" className="mt-0">
                <DayView
                  selectedDate={selectedDate}
                  appointments={appointments}
                  onSlotClick={handleSlotClick}
                  onEditAppointment={handleEditAppointment}
                  onStatusChange={handleStatusChange}
                  onCancel={handleCancelAppointment}
                  onAddPatient={(date) => {
                    setEditingAppointment(null);
                    setInitialDate(date);
                    setInitialTime("");
                    setShowForm(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="week" className="mt-0">
                <WeekView
                  weekStart={currentWeek}
                  appointments={appointments}
                  onSlotClick={handleSlotClick}
                  onEditAppointment={handleEditAppointment}
                  onStatusChange={handleStatusChange}
                  onCancel={handleCancelAppointment}
                />
              </TabsContent>

              <TabsContent value="month" className="mt-0">
                <MonthView
                  currentMonth={currentMonth}
                  appointments={appointments}
                  onDayClick={handleDayClick}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingAppointment(null);
            setInitialDate("");
            setInitialTime("");
          }
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Editar Consulta" : "Nova Consulta"}
              </DialogTitle>
            </DialogHeader>
            <AppointmentForm
              appointment={editingAppointment}
              patients={patients}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAppointment(null);
              }}
              isLoading={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
              initialDate={initialDate}
              initialTime={initialTime}
            />
          </DialogContent>
        </Dialog>
    </div>
  );
}