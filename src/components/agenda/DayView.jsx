import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AppointmentCard from "./AppointmentCard";
import { Plus } from "lucide-react";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

export default function DayView({ 
  selectedDate, 
  appointments, 
  onSlotClick,
  onEditAppointment,
  onStatusChange,
  onCancel
}) {
  const getAppointmentsForTime = (time) => {
    return appointments.filter(apt => 
      apt.date === format(selectedDate, "yyyy-MM-dd") && apt.time === time
    );
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-slate-900">
          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
      </div>
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-2">
          {timeSlots.map((time) => {
            const slotAppointments = getAppointmentsForTime(time);
            return (
              <div key={time} className="flex items-start gap-4">
                <div className="w-20 py-4 text-sm font-medium text-slate-500 flex-shrink-0">
                  {time}
                </div>
                
                <div className="flex-1 min-h-[80px] border-l-2 border-slate-200 pl-4">
                  {slotAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {slotAppointments.map((apt) => (
                        <AppointmentCard
                          key={apt.id}
                          appointment={apt}
                          onEdit={onEditAppointment}
                          onStatusChange={onStatusChange}
                          onCancel={onCancel}
                        />
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => onSlotClick(format(selectedDate, "yyyy-MM-dd"), time)}
                      className="w-full h-full min-h-[70px] border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-center text-slate-400 hover:text-blue-500 group"
                    >
                      <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Agendar consulta</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}