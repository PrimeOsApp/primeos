import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Check, X, Settings, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MarketingSyncCard() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState({
    googleAds: null,
    facebookAds: null
  });

  const syncPlatform = async (platform) => {
    setSyncing(true);
    try {
      const functionName = platform === 'google' ? 'syncGoogleAds' : 'syncFacebookAds';
      const response = await base44.functions.invoke(functionName, {});
      
      if (response.data?.success) {
        toast.success(response.data.message);
        setLastSync(prev => ({
          ...prev,
          [platform === 'google' ? 'googleAds' : 'facebookAds']: new Date()
        }));
      } else {
        const error = response.data?.error || response.data?.message || 'Erro ao sincronizar';
        
        if (error.includes('Missing credentials')) {
          toast.error('Configure os secrets primeiro', {
            description: 'Vá em Dashboard → Settings → Secrets',
            duration: 5000
          });
        } else {
          toast.error(error);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const syncAll = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('syncAllMarketingPlatforms', {});
      
      if (response.data?.success) {
        toast.success(response.data.message);
        const now = new Date();
        setLastSync({
          googleAds: now,
          facebookAds: now
        });
      } else {
        toast.error('Erro ao sincronizar algumas plataformas', {
          description: 'Verifique as configurações no Dashboard'
        });
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const platforms = [
    {
      name: 'Google Ads',
      key: 'google',
      color: 'bg-blue-500',
      lastSync: lastSync.googleAds
    },
    {
      name: 'Facebook Ads',
      key: 'facebook',
      color: 'bg-indigo-500',
      lastSync: lastSync.facebookAds
    }
  ];

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-blue-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-600" />
          Sincronização Automática
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {platforms.map((platform) => (
            <div key={platform.key} className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{platform.name}</span>
                <div className={cn("w-2 h-2 rounded-full", platform.lastSync ? "bg-green-500" : "bg-slate-300")} />
              </div>
              {platform.lastSync && (
                <p className="text-xs text-slate-500 mb-2">
                  Última: {platform.lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => syncPlatform(platform.key)}
                disabled={syncing}
                className="w-full"
              >
                {syncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={syncAll}
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
              Sincronizar Todas
            </>
          )}
        </Button>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Settings className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-900 mb-1">Configuração necessária</p>
              <p className="text-xs text-amber-700">
                Configure os secrets das APIs no <strong>Dashboard → Settings → Secrets</strong>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}