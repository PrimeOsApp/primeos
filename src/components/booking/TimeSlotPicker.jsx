import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function TimeSlotPicker({ date, duration, existingAppointments, onTimeSelect, onBack }) {
  const isTimeAvailable = (time) => {
    // Check if time slot conflicts with existing appointments
    const [hours, minutes] = time.split(':').map(Number);
    const slotStart = hours * 60 + minutes;
    const slotEnd = slotStart + duration;

    return !existingAppointments.some(apt => {
      if (apt.time) {
        const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
        const aptStart = aptHours * 60 + aptMinutes;
        const aptEnd = aptStart + (apt.duration_minutes || 30);

        return (slotStart < aptEnd && slotEnd > aptStart);
      }
      return false;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Escolha o Horário</h2>
        <p className="text-gray-600 mt-2 capitalize">
          {formatDate(date)}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Morning Slots */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Manhã
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {timeSlots.filter(t => parseInt(t.split(':')[0]) < 12).map(time => {
              const available = isTimeAvailable(time);
              return (
                <Button
                  key={time}
                  onClick={() => onTimeSelect(time)}
                  disabled={!available}
                  variant={available ? "outline" : "ghost"}
                  className={`
                    h-12 font-medium transition-all
                    ${available 
                      ? 'hover:bg-blue-600 hover:text-white hover:border-blue-600' 
                      : 'opacity-40 cursor-not-allowed'
                    }
                  `}
                >
                  {time}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Afternoon Slots */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Tarde
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {timeSlots.filter(t => parseInt(t.split(':')[0]) >= 12).map(time => {
              const available = isTimeAvailable(time);
              return (
                <Button
                  key={time}
                  onClick={() => onTimeSelect(time)}
                  disabled={!available}
                  variant={available ? "outline" : "ghost"}
                  className={`
                    h-12 font-medium transition-all
                    ${available 
                      ? 'hover:bg-blue-600 hover:text-white hover:border-blue-600' 
                      : 'opacity-40 cursor-not-allowed'
                    }
                  `}
                >
                  {time}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Voltar
          </Button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Duração:</strong> {duration} minutos
          </p>
          <p className="text-sm text-blue-900 mt-1">
            Horários em cinza já estão ocupados
          </p>
        </div>
      </div>
    </div>
  );
}