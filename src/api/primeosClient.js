import { createPrimeosSdkClient } from '@/lib/primeosSdk';
import { createLocalPrimeosClient } from '@/lib/localPrimeosClient';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
const viteEnv = /** @type {any} */ (import.meta)?.env || {};
const useRemoteSdk = String(viteEnv.VITE_USE_REMOTE_SDK || '').toLowerCase() === 'true';
export const dataMode = useRemoteSdk ? 'remote' : 'local';

// Uses local `data/database.json` by default. Set VITE_USE_REMOTE_SDK=true to force remote SDK.
export const primeos = useRemoteSdk
  ? createPrimeosSdkClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl
    })
  : createLocalPrimeosClient();
