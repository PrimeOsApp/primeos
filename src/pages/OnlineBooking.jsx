import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import ServiceSelection from "@/components/booking/ServiceSelection";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";

const STEPS = {
  SERVICE: 'service',
  DATE: 'date',
  TIME: 'time',
  INFO: 'info',
  CONFIRM: 'confirm'
};

export default function OnlineBooking() {
  const [currentStep, setCurrentStep] = useState(STEPS.SERVICE);
  const [bookingData, setBookingData] = useState({
    service_type: '',
    date: '',
    time: '',
    duration_minutes: 30,
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing appointments to check availability
  const { data: existingAppointments = [] } = useQuery({
    queryKey: ['appointments', bookingData.date],
    queryFn: async () => {
      if (!bookingData.date) return [];
      return base44.entities.Appointment.filter({ date: bookingData.date });
    },
    enabled: !!bookingData.date
  });

  const { data: dentists = [] } = useQuery({
    queryKey: ['dentists_active'],
    queryFn: () => base44.entities.Dentist.filter({ is_active: true }),
  });

  const { data: blockouts = [] } = useQuery({
    queryKey: ['blockouts', bookingData.date],
    queryFn: () => bookingData.date ? base44.entities.DentistBlockout.filter({ date: bookingData.date }) : [],
    enabled: !!bookingData.date
  });

  const handleServiceSelect = (service) => {
    setBookingData(prev => ({
      ...prev,
      service_type: service.type,
      duration_minutes: service.duration,
      dentist_id: '',
      provider: ''
    }));
    setCurrentStep(STEPS.DATE);
  };

  const handleDateSelect = (date) => {
    setBookingData(prev => ({ ...prev, date }));
    setCurrentStep(STEPS.TIME);
  };

  const handleTimeSelect = (time) => {
    setBookingData(prev => ({ ...prev, time }));
    setCurrentStep(STEPS.INFO);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!bookingData.patient_name || !bookingData.patient_phone) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await base44.functions.invoke('processOnlineBooking', bookingData);
      
      if (response.data.success) {
        setBookingSuccess(true);
        setCurrentStep(STEPS.CONFIRM);
      } else {
        setError(response.data.error || 'Erro ao processar agendamento');
      }
    } catch (err) {
      setError('Erro ao processar agendamento. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const resetBooking = () => {
    setBookingData({
      service_type: '',
      date: '',
      time: '',
      duration_minutes: 30,
      patient_name: '',
      patient_phone: '',
      patient_email: '',
      notes: ''
    });
    setCurrentStep(STEPS.SERVICE);
    setBookingSuccess(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Agendamento Online
          </h1>
          <p className="text-gray-600">
            Agende sua consulta de forma rápida e fácil
          </p>
        </div>

        {/* Progress Steps */}
        {!bookingSuccess && (
          <div className="mb-8">
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              {[
                { key: STEPS.SERVICE, label: 'Serviço', icon: CalendarIcon },
                { key: STEPS.DATE, label: 'Data', icon: CalendarIcon },
                { key: STEPS.TIME, label: 'Horário', icon: Clock },
                { key: STEPS.INFO, label: 'Dados', icon: User }
              ].map((step, index, array) => {
                const isActive = currentStep === step.key;
                const isPast = Object.values(STEPS).indexOf(currentStep) > Object.values(STEPS).indexOf(step.key);
                
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all
                        ${isActive ? 'bg-blue-600 text-white scale-110' : ''}
                        ${isPast ? 'bg-green-600 text-white' : ''}
                        ${!isActive && !isPast ? 'bg-gray-200 text-gray-500' : ''}
                      `}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < array.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 ${isPast ? 'bg-green-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-8">
                {currentStep === STEPS.SERVICE && (
                  <ServiceSelection onSelect={handleServiceSelect} />
                )}

                {currentStep === STEPS.DATE && (
                  <AvailabilityCalendar 
                    onDateSelect={handleDateSelect}
                    onBack={handleBack}
                  />
                )}

                {currentStep === STEPS.TIME && (
                  <TimeSlotPicker
                    date={bookingData.date}
                    duration={bookingData.duration_minutes}
                    existingAppointments={existingAppointments}
                    onTimeSelect={handleTimeSelect}
                    onBack={handleBack}
                  />
                )}

                {currentStep === STEPS.INFO && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Seus Dados</h2>
                      <p className="text-gray-600 mt-2">
                        Complete com suas informações para confirmar o agendamento
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 text-sm text-blue-900">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-medium">{bookingData.date}</span>
                        <Clock className="w-4 h-4 ml-4" />
                        <span className="font-medium">{bookingData.time}</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={bookingData.patient_name}
                        onChange={(e) => setBookingData(prev => ({ ...prev, patient_name: e.target.value }))}
                        placeholder="Seu nome completo"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={bookingData.patient_phone}
                        onChange={(e) => setBookingData(prev => ({ ...prev, patient_phone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={bookingData.patient_email}
                        onChange={(e) => setBookingData(prev => ({ ...prev, patient_email: e.target.value }))}
                        placeholder="seu@email.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={bookingData.notes}
                        onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Alguma informação adicional que gostaria de compartilhar?"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !bookingData.patient_name || !bookingData.patient_phone}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirmar Agendamento
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === STEPS.CONFIRM && bookingSuccess && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Agendamento Confirmado!
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Você receberá uma confirmação por WhatsApp/Email em breve. 
                      Enviaremos um lembrete 1 dia antes da consulta.
                    </p>
                    
                    <div className="bg-blue-50 p-6 rounded-lg mb-8 max-w-md mx-auto">
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Data</p>
                            <p className="font-semibold text-gray-900">{bookingData.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Horário</p>
                            <p className="font-semibold text-gray-900">{bookingData.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Paciente</p>
                            <p className="font-semibold text-gray-900">{bookingData.patient_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={resetBooking}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Fazer Novo Agendamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}