# Mobile App Guide

## Overview

The PropertyCheck mobile app is built with Expo SDK 54 and React Native 0.81, using Expo Router for file-based navigation. It provides the core functionality for conducting property inspections on-site.

## Project Structure

```
apps/mobile/
├── app/                        # Expo Router pages
│   ├── (auth)/                 # Auth screens (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                 # Tab navigation (authenticated)
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home/Properties
│   │   └── settings.tsx
│   ├── property/               # Property screens
│   │   ├── [id].tsx            # Property detail
│   │   └── new.tsx             # Create property
│   ├── inspection/             # Inspection screens
│   │   ├── [id].tsx            # Inspection detail
│   │   └── new.tsx             # Create inspection
│   ├── _layout.tsx             # Root layout
│   └── +not-found.tsx          # 404 page
│
├── components/                 # React Native components
│   ├── ui/                     # UI primitives
│   ├── forms/                  # Form components
│   └── inspection/             # Inspection-specific
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useProperties.ts
│   └── useActionState.ts
│
├── lib/                        # Utilities
│   ├── supabase.ts             # Supabase client
│   └── storage.ts              # Secure storage
│
├── assets/                     # Static assets
├── app.config.ts               # Expo configuration
└── package.json
```

## Navigation

### Expo Router Setup

Expo Router provides file-based routing similar to Next.js App Router:

```typescript
// app/_layout.tsx - Root layout
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
      <Stack.Screen name="property" />
      <Stack.Screen name="inspection" />
    </Stack>
  );
}
```

### Tab Navigation

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Properties',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Dynamic Routes

```typescript
// app/property/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch property by id
  const { data: property } = useProperty(id);

  return (
    <View>
      <Text>{property?.address}</Text>
    </View>
  );
}
```

## Native Features

### Camera Integration

```typescript
// Using expo-camera for photo capture
import { Camera, CameraView } from 'expo-camera';
import { useState, useRef } from 'react';

export function CameraCapture({ onCapture }: { onCapture: (uri: string) => void }) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission?.granted) {
    return (
      <View>
        <Text>Camera permission required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo) {
        onCapture(photo.uri);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
      />
      <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
        <Ionicons name="camera" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
```

### Image Picker

```typescript
// Using expo-image-picker for gallery access
import * as ImagePicker from 'expo-image-picker';

export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    allowsMultipleSelection: false,
  });

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }

  return null;
}

export async function pickMultipleImages(): Promise<string[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.8,
    selectionLimit: 10,
  });

  if (!result.canceled) {
    return result.assets.map(asset => asset.uri);
  }

  return [];
}
```

### File System Operations

```typescript
// Using expo-file-system for local storage
import * as FileSystem from 'expo-file-system';

// Save image locally
export async function saveImageLocally(uri: string, filename: string): Promise<string> {
  const directory = `${FileSystem.documentDirectory}photos/`;

  // Ensure directory exists
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

  const destination = `${directory}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destination });

  return destination;
}

// Get file info
export async function getFileInfo(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  return info;
}

// Read file as base64
export async function readAsBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}
```

### Secure Storage

```typescript
// Using expo-secure-store for credentials
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'supabase_session';

export async function saveSession(session: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, session);
}

export async function getSession(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

### Share & Export

```typescript
// Using expo-sharing for share functionality
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as MailComposer from 'expo-mail-composer';

// Share a file
export async function shareFile(uri: string, mimeType: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType,
      dialogTitle: 'Share Inspection',
    });
  }
}

// Generate and share PDF
export async function generatePDF(html: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });
  return uri;
}

// Send email with attachment
export async function sendEmail(
  recipients: string[],
  subject: string,
  body: string,
  attachments?: string[]
) {
  const isAvailable = await MailComposer.isAvailableAsync();

  if (isAvailable) {
    await MailComposer.composeAsync({
      recipients,
      subject,
      body,
      attachments,
    });
  }
}
```

## Custom Hooks

### useAuth

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
```

### useProperties

```typescript
// hooks/useProperties.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Property {
  id: string;
  address: string;
  property_type: string;
  notes: string | null;
  created_at: string;
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const createProperty = async (property: Omit<Property, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (error) throw error;
    setProperties(prev => [data, ...prev]);
    return data;
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
    createProperty,
    deleteProperty,
  };
}
```

### useActionState

React 19 pattern for form actions:

```typescript
// hooks/useActionState.ts
import { useState, useCallback } from 'react';

type ActionState<T> = {
  data: T | null;
  error: Error | null;
  isPending: boolean;
};

export function useActionState<T, Args extends unknown[]>(
  action: (...args: Args) => Promise<T>
): [ActionState<T>, (...args: Args) => Promise<void>] {
  const [state, setState] = useState<ActionState<T>>({
    data: null,
    error: null,
    isPending: false,
  });

  const execute = useCallback(async (...args: Args) => {
    setState({ data: null, error: null, isPending: true });
    try {
      const result = await action(...args);
      setState({ data: result, error: null, isPending: false });
    } catch (err) {
      setState({
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error'),
        isPending: false,
      });
    }
  }, [action]);

  return [state, execute];
}
```

## Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@propertycheck/database/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter for React Native
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Photo Upload Flow

```typescript
// Complete flow for capturing and uploading photos
import { encode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

async function uploadPhoto(
  localUri: string,
  inspectionId: string,
  roomType: string,
  caption?: string
) {
  // 1. Read file as base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 2. Generate unique filename
  const filename = `${Date.now()}.jpg`;
  const storagePath = `${user.id}/${inspectionId}/${filename}`;

  // 3. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('inspection-photos')
    .upload(storagePath, encode(base64), {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // 4. Create database record
  const { data, error } = await supabase
    .from('inspection_photos')
    .insert({
      inspection_id: inspectionId,
      storage_path: storagePath,
      room_type: roomType,
      caption: caption || null,
      sort_order: 0,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
```

## Styling

### Native Styling Patterns

```typescript
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Theme Constants

```typescript
// lib/theme.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    500: '#6b7280',
    900: '#111827',
  },
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '600' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
};
```

## App Configuration

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PropertyCheck',
  slug: 'propertycheck',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#2563eb',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.propertycheck.app',
    infoPlist: {
      NSCameraUsageDescription: 'PropertyCheck needs camera access to take inspection photos.',
      NSPhotoLibraryUsageDescription: 'PropertyCheck needs photo library access to select inspection photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2563eb',
    },
    package: 'com.propertycheck.app',
    permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow PropertyCheck to access your camera.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow PropertyCheck to access your photos.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
  },
});
```

## Build & Deployment

### Development

```bash
# Start development server
npm run dev:mobile
# or
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### Production Build (EAS)

```bash
# Configure EAS
npx eas-cli build:configure

# Build for iOS
npx eas build --platform ios

# Build for Android
npx eas build --platform android

# Submit to App Store
npx eas submit --platform ios

# Submit to Play Store
npx eas submit --platform android
```

---

*See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment configuration.*
