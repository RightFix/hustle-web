import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hustle.app',
  appName: 'Hustle',
  webDir: 'dist',
  server: {
    url: 'https://hustle.example.com',
    cleartext: true,
  },
};

export default config;
