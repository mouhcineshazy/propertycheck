import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { ExpoConfig, ConfigContext } from 'expo/config';

// Load .env from the monorepo root
dotenvConfig({ path: resolve(__dirname, '../../.env') });

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PropertyCheck',
  slug: 'propertycheck',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'propertycheck',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.propertycheck.app',
    infoPlist: {
      NSCameraUsageDescription:
        'PropertyCheck needs camera access to take photos during property inspections.',
      NSPhotoLibraryUsageDescription:
        'PropertyCheck needs photo library access to select existing photos for inspections.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.propertycheck.app',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission:
          'PropertyCheck needs camera access to take photos during property inspections.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'PropertyCheck needs photo library access to select existing photos for inspections.',
      },
    ],
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});
