import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MonthView({ currentMonth, appointments, onDayClick }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  const getDayAppointments = (day) => {
    return appointments.filter(apt => apt.date === format(day, "yyyy-MM-dd"));
  };

  return (
    <div>
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayAppointments = getDayAppointments(day);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[100px] p-2 rounded-lg border transition-all text-left",
                isCurrentMonth ? "bg-white hover:bg-blue-50 border-slate-200" : "bg-slate-50 border-slate-100 text-slate-400",
                isToday && "ring-2 ring-blue-500"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  isToday && "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                )}>
                  {format(day, "d")}
                </span>
                {dayAppointments.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayAppointments.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="text-xs p-1 rounded bg-blue-100 text-blue-700 truncate"
                  >
                    {apt.time} - {apt.patient_name}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-slate-500 text-center">
                    +{dayAppointments.length - 3} mais
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}