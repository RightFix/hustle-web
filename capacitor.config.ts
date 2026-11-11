import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hustle.app',
  appName: 'Hustle',
  webDir: 'dist',
  // Production: load the deployed web app (HTTPS). For LAN/dev testing, set
  // server.url to your dev origin (e.g. http://192.168.1.20:8000) and, if
  // using plain HTTP, temporarily set cleartext: true and enable
  // android:usesCleartextTraffic in AndroidManifest.xml.
  // server: {
  //   url: 'https://hustle.example.com',
  //   cleartext: false,
  // },
};

export default config;
