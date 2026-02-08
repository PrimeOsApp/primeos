import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import SegmentForm from "@/components/segments/SegmentForm";
import SegmentCard from "@/components/segments/SegmentCard";
import SegmentPreview from "@/components/segments/SegmentPreview";
import SegmentCampaign from "@/components/segments/SegmentCampaign";
import { Target, Plus, Users, TrendingUp, Mail } from "lucide-react";
import { toast } from "sonner";

export default function CustomerSegments() {
  const [showForm, setShowForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [previewSegment, setPreviewSegment] = useState(null);
  const [campaignSegment, setCampaignSegment] = useState(null);
  const queryClient = useQueryClient();

  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: () => base44.entities.CustomerSegment.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomerSegment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      setShowForm(false);
      setEditingSegment(null);
      toast.success("Segmento criado!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomerSegment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      setShowForm(false);
      setEditingSegment(null);
      toast.success("Segmento atualizado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomerSegment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      toast.success("Segmento excluído!");
    },
  });

  const handleSubmit = (data) => {
    if (editingSegment) {
      updateMutation.mutate({ id: editingSegment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (segment) => {
    setEditingSegment(segment);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este segmento?")) {
      deleteMutation.mutate(id);
    }
  };

  const activeSegments = segments.filter((s) => s.ativo);
  const totalContacts = [...customers, ...leads];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Segmentação de Clientes"
          subtitle="Crie segmentos dinâmicos e campanhas direcionadas"
          icon={Target}
          actionLabel="Criar Segmento"
          onAction={() => {
            setEditingSegment(null);
            setShowForm(true);
          }}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Segmentos Ativos</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">
                    {activeSegments.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Segmentos</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {segments.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Contatos Total</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {totalContacts.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Campanhas</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {segments.reduce((sum, s) => sum + (s.total_leads || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-6">
            <SegmentForm
              segment={editingSegment}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingSegment(null);
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        )}

        {/* Segments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              customers={customers}
              leads={leads}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={setPreviewSegment}
              onCampaign={setCampaignSegment}
            />
          ))}
        </div>

        {/* Preview Modal */}
        {previewSegment && (
          <SegmentPreview
            segment={previewSegment}
            customers={customers}
            leads={leads}
            onClose={() => setPreviewSegment(null)}
          />
        )}

        {/* Campaign Modal */}
        {campaignSegment && (
          <SegmentCampaign
            segment={campaignSegment}
            customers={customers}
            leads={leads}
            onClose={() => setCampaignSegment(null)}
          />
        )}
      </div>
    </div>
  );
}