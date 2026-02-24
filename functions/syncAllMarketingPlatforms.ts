import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);

    const results = {
      googleAds: { success: false, message: '', metrics: 0 },
      facebookAds: { success: false, message: '', metrics: 0 }
    };

    // Sync Google Ads
    try {
      const googleResponse = await primeos.asServiceRole.functions.invoke('syncGoogleAds', {});
      results.googleAds = {
        success: googleResponse.data?.success || false,
        message: googleResponse.data?.message || googleResponse.data?.error || 'Unknown error',
        metrics: googleResponse.data?.metrics || 0
      };
    } catch (error) {
      results.googleAds.message = error.message;
    }

    // Sync Facebook Ads
    try {
      const facebookResponse = await primeos.asServiceRole.functions.invoke('syncFacebookAds', {});
      results.facebookAds = {
        success: facebookResponse.data?.success || false,
        message: facebookResponse.data?.message || facebookResponse.data?.error || 'Unknown error',
        metrics: facebookResponse.data?.metrics || 0
      };
    } catch (error) {
      results.facebookAds.message = error.message;
    }

    const totalMetrics = results.googleAds.metrics + results.facebookAds.metrics;
    const allSuccess = results.googleAds.success && results.facebookAds.success;

    return Response.json({
      success: allSuccess,
      message: `Sincronização completa: ${totalMetrics} métricas importadas`,
      results,
      totalMetrics
    });

  } catch (error) {
    console.error('Error in syncAllMarketingPlatforms:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});