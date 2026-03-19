import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waverow.app',
  appName: 'WaveRow',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      hideFormAccessoryBar: true,
      resize: 'body',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1A3A2A',
    },
  },
};

export default config;
