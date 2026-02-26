import { createLocalPrimeosClient } from '@/lib/localPrimeosClient';
import { appParams } from '@/lib/app-params';

const { appId } = appParams;
const viteEnv = /** @type {any} */ (import.meta)?.env || {};
const useRemoteSdk = String(viteEnv.VITE_USE_REMOTE_SDK || '').toLowerCase() === 'true';
export const dataMode = 'local';

if (useRemoteSdk) {
  console.warn('VITE_USE_REMOTE_SDK=true is set, but Base44 SDK import is disabled for this build. Falling back to local data mode.', {
    appId
  });
}

export const primeos = createLocalPrimeosClient();
