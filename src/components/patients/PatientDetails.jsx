import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Pill,
  AlertTriangle,
  FileText,
  Shield,
  Users,
  Pencil,
  Activity,
  Brain,
  MapPin,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import PatientAIInsights from "@/components/patients/PatientAIInsights";
import PatientAppointmentHistory from "@/components/patients/PatientAppointmentHistory";
import PatientImageExams from "@/components/patients/PatientImageExams";
import PatientFamilyHistory from "@/components/patients/PatientFamilyHistory";
import PatientPrescriptions from "@/components/patients/PatientPrescriptions";
import PatientCheckup from "@/components/patients/PatientCheckup";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PatientDetails({ patient: initialPatient, onBack, onEdit }) {
  const [patient, setPatient] = useState(initialPatient);
  const age = patient.date_of_birth
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : null;

  const getStatusColor = (status) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-700 border-green-200";
      case "inativo":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "arquivado":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Pacientes
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
                {patient.patient_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {patient.patient_name || "Sem nome"}
                </h1>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status || "ativo"}
                </Badge>
              </div>
            </div>
            <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
              <Pencil className="w-4 h-4 mr-2" />
              Editar Paciente
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.patient_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-900">{patient.patient_email}</p>
                    </div>
                  </div>
                )}
                {patient.patient_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Telefone</p>
                      <p className="text-sm text-slate-900">{patient.patient_phone}</p>
                    </div>
                  </div>
                )}
                {patient.date_of_birth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Data de Nascimento</p>
                      <p className="text-sm text-slate-900">
                        {format(new Date(patient.date_of_birth), "dd/MM/yyyy", { locale: ptBR })}
                        {age && ` (${age} anos)`}
                      </p>
                    </div>
                  </div>
                )}
                {patient.blood_type && patient.blood_type !== "Não informado" && (
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-slate-500">Tipo Sanguíneo</p>
                      <p className="text-sm font-semibold text-red-600">{patient.blood_type}</p>
                    </div>
                  </div>
                )}
                {patient.cpf && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">CPF</p>
                      <p className="text-sm text-slate-900">{patient.cpf}</p>
                    </div>
                  </div>
                )}
                {patient.occupation && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Profissão</p>
                      <p className="text-sm text-slate-900">{patient.occupation}</p>
                    </div>
                  </div>
                )}
                {patient.address?.city && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Endereço</p>
                      <p className="text-sm text-slate-900">
                        {[patient.address.street, patient.address.number, patient.address.city, patient.address.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {patient.emergency_contact?.name && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Nome</p>
                    <p className="text-sm text-slate-900">{patient.emergency_contact.name}</p>
                  </div>
                  {patient.emergency_contact.relationship && (
                    <div>
                      <p className="text-xs text-slate-500">Relação</p>
                      <p className="text-sm text-slate-900">{patient.emergency_contact.relationship}</p>
                    </div>
                  )}
                  {patient.emergency_contact.phone && (
                    <div>
                      <p className="text-xs text-slate-500">Telefone</p>
                      <p className="text-sm text-slate-900">{patient.emergency_contact.phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Insurance */}
            {patient.insurance_info?.has_insurance && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Plano de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {patient.insurance_info.provider && (
                    <div>
                      <p className="text-xs text-slate-500">Operadora</p>
                      <p className="text-sm text-slate-900">{patient.insurance_info.provider}</p>
                    </div>
                  )}
                  {patient.insurance_info.policy_number && (
                    <div>
                      <p className="text-xs text-slate-500">Número da Apólice</p>
                      <p className="text-sm text-slate-900">{patient.insurance_info.policy_number}</p>
                    </div>
                  )}
                  {patient.insurance_info.coverage_percentage && (
                    <div>
                      <p className="text-xs text-slate-500">Cobertura</p>
                      <p className="text-sm text-slate-900">{patient.insurance_info.coverage_percentage}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Medical History */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Histórico Médico</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="appointments" className="w-full">
                  <TabsList className="flex flex-wrap gap-1 h-auto w-full mb-2">
                    <TabsTrigger value="appointments" className="text-xs">Consultas</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="text-xs">Prescrições</TabsTrigger>
                    <TabsTrigger value="checkup" className="text-xs">Check-up</TabsTrigger>
                    <TabsTrigger value="images" className="text-xs">Imagens</TabsTrigger>
                    <TabsTrigger value="family" className="text-xs">Família</TabsTrigger>
                    <TabsTrigger value="allergies" className="text-xs">Alergias</TabsTrigger>
                    <TabsTrigger value="medications" className="text-xs">Medicamentos</TabsTrigger>
                    <TabsTrigger value="conditions" className="text-xs">Condições</TabsTrigger>
                    <TabsTrigger value="treatments" className="text-xs">Tratamentos</TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs flex items-center gap-1">
                      <Brain className="w-3 h-3 text-indigo-600" />IA
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="appointments" className="pt-4">
                    <PatientAppointmentHistory patient={patient} />
                  </TabsContent>

                  <TabsContent value="prescriptions" className="pt-4">
                    <PatientPrescriptions patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="checkup" className="pt-4">
                    <PatientCheckup patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="images" className="pt-4">
                    <PatientImageExams patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="family" className="pt-4">
                    <PatientFamilyHistory patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="allergies" className="space-y-4 pt-4">
                    {patient.allergies && patient.allergies.length > 0 ? (
                      patient.allergies.map((allergy, index) => (
                        <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-red-900">{allergy.allergen}</p>
                              {allergy.severity && <Badge className="mt-1 bg-red-100 text-red-700">{allergy.severity}</Badge>}
                              {allergy.reaction && <p className="text-sm text-red-700 mt-2">{allergy.reaction}</p>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p>Nenhuma alergia registrada</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="medications" className="space-y-4 pt-4">
                    {patient.current_medications && patient.current_medications.length > 0 ? (
                      patient.current_medications.map((med, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-3">
                            <Pill className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-blue-900">{med.name}</p>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-blue-700">
                                {med.dosage && <p>Dosagem: {med.dosage}</p>}
                                {med.frequency && <p>Frequência: {med.frequency}</p>}
                                {med.start_date && <p>Início: {format(new Date(med.start_date), "dd/MM/yyyy", { locale: ptBR })}</p>}
                                {med.prescribing_doctor && <p>Médico: {med.prescribing_doctor}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Pill className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p>Nenhum medicamento em uso</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="conditions" className="space-y-4 pt-4">
                    {patient.medical_conditions && patient.medical_conditions.length > 0 ? (
                      patient.medical_conditions.map((condition, index) => (
                        <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-start gap-3">
                            <Activity className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-900">{condition}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p>Nenhuma condição médica registrada</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="treatments" className="space-y-4 pt-4">
                    {patient.past_treatments && patient.past_treatments.length > 0 ? (
                      patient.past_treatments.map((treatment, index) => (
                        <div key={index} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-indigo-900">{treatment.treatment}</p>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-indigo-700">
                                {treatment.tooth_number && <p>Dente: {treatment.tooth_number}</p>}
                                {treatment.date && <p>Data: {format(new Date(treatment.date), "dd/MM/yyyy", { locale: ptBR })}</p>}
                                {treatment.dentist && <p>Dentista: {treatment.dentist}</p>}
                                {treatment.cost && <p>Custo: R$ {treatment.cost.toFixed(2)}</p>}
                              </div>
                              {treatment.notes && <p className="text-sm text-indigo-600 mt-2">{treatment.notes}</p>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p>Nenhum tratamento anterior registrado</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="ai" className="pt-4">
                    <PatientAIInsights patient={patient} />
                  </TabsContent>
                </Tabs>

                {patient.notes && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Observações Gerais</p>
                    <p className="text-sm text-slate-700">{patient.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}