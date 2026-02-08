import { Card } from "@/components/ui/card";
import { Clock, Stethoscope, HeartPulse, ShieldCheck, Zap, Brain, Activity } from "lucide-react";

const services = [
  {
    type: 'consultation',
    label: 'Consulta',
    description: 'Primeira consulta ou avaliação geral',
    duration: 30,
    icon: Stethoscope,
    color: 'bg-blue-500'
  },
  {
    type: 'checkup',
    label: 'Check-up',
    description: 'Revisão e limpeza dental',
    duration: 45,
    icon: ShieldCheck,
    color: 'bg-green-500'
  },
  {
    type: 'procedure',
    label: 'Procedimento',
    description: 'Tratamentos e intervenções',
    duration: 60,
    icon: Activity,
    color: 'bg-purple-500'
  },
  {
    type: 'follow_up',
    label: 'Retorno',
    description: 'Acompanhamento de tratamento',
    duration: 20,
    icon: HeartPulse,
    color: 'bg-orange-500'
  },
  {
    type: 'emergency',
    label: 'Emergência',
    description: 'Atendimento urgente',
    duration: 30,
    icon: Zap,
    color: 'bg-red-500'
  },
  {
    type: 'diagnostic',
    label: 'Diagnóstico',
    description: 'Avaliação e exames',
    duration: 30,
    icon: Brain,
    color: 'bg-indigo-500'
  }
];

export default function ServiceSelection({ onSelect }) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Selecione o Tipo de Serviço</h2>
        <p className="text-gray-600 mt-2">
          Escolha o serviço que você precisa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card
              key={service.type}
              className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-blue-400"
              onClick={() => onSelect(service)}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full ${service.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {service.label}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {service.description}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} minutos</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}