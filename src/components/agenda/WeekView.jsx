import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import AppointmentCard from "./AppointmentCard";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function WeekView({ 
  weekStart, 
  appointments, 
  onSlotClick, 
  onEditAppointment,
  onStatusChange,
  onCancel
}) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const getAppointmentsForDateAndTime = (date, time) => {
    return appointments.filter(apt => 
      apt.date === format(date, "yyyy-MM-dd") && apt.time === time
    );
  };

  return (
    <div className="flex border rounded-lg overflow-hidden bg-white">
      {/* Time Column */}
      <div className="w-20 border-r bg-slate-50">
        <div className="h-16 border-b flex items-center justify-center font-medium text-slate-600">
          Horário
        </div>
        <ScrollArea className="h-[600px]">
          {timeSlots.map((time) => (
            <div key={time} className="h-24 border-b flex items-center justify-center text-sm text-slate-600 font-medium">
              {time}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Days Columns */}
      <div className="flex-1 flex">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={day.toISOString()} className="flex-1 border-r last:border-r-0">
              {/* Day Header */}
              <div className={cn(
                "h-16 border-b flex flex-col items-center justify-center",
                isToday && "bg-blue-50"
              )}>
                <span className="text-xs text-slate-500 uppercase">
                  {format(day, "EEE", { locale: ptBR })}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  isToday && "bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center"
                )}>
                  {format(day, "d")}
                </span>
              </div>

              {/* Time Slots */}
              <ScrollArea className="h-[600px]">
                {timeSlots.map((time) => {
                  const slotAppointments = getAppointmentsForDateAndTime(day, time);
                  return (
                    <div key={time} className="h-24 border-b p-1">
                      {slotAppointments.length > 0 ? (
                        <div className="space-y-1">
                          {slotAppointments.map((apt) => (
                            <AppointmentCard
                              key={apt.id}
                              appointment={apt}
                              compact={true}
                              onEdit={onEditAppointment}
                              onStatusChange={onStatusChange}
                              onCancel={onCancel}
                            />
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => onSlotClick(format(day, "yyyy-MM-dd"), time)}
                          className="w-full h-full hover:bg-blue-50 rounded transition-colors"
                        />
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}