import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Calendar, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function GoogleCalendarSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('syncGoogleCalendar', {});
      
      if (response.data?.success) {
        toast.success(response.data.message);
        setLastSync(new Date());
      } else if (response.data?.needsAuth) {
        toast.error('Conecte o Google Calendar primeiro', {
          description: 'Configure a integração nas configurações',
          duration: 5000
        });
      } else {
        toast.error(response.data?.error || 'Erro ao sincronizar');
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao sincronizar calendário');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Sincronização Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-700 mb-2">
              Importe automaticamente eventos dos próximos 30 dias do seu Google Calendar
            </p>
            {lastSync && (
              <p className="text-xs text-slate-500">
                Última sincronização: {lastSync.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Agora
            </>
          )}
        </Button>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-900 mb-1">
                Configure primeiro
              </p>
              <p className="text-xs text-amber-700">
                Autorize o acesso ao Google Calendar no Dashboard para usar esta funcionalidade
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Importa eventos dos próximos 30 dias
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Cria agendamentos automaticamente
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Não duplica eventos existentes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}