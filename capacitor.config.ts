import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.primeodontologia.os',
  appName: 'Prime Odontologia OS',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
