# Mobile App — CLAUDE.md (`apps/mobile/`)

Expo SDK 54, React Native 0.81, Expo Router. See root `CLAUDE.md` for universal rules.

## File Conventions

```
app/
  (auth)/           # Unauthenticated screens: login, register, forgot-password
  (tabs)/           # Tab navigation (authenticated): index (Properties), settings
  property/
    [id].tsx        # Property detail
    new.tsx         # Create property
  inspection/
    [id].tsx        # Inspection detail
    new.tsx         # Create inspection
  _layout.tsx       # Root layout — handles auth gating
  onboarding.tsx    # First-run onboarding
components/
  ui/               # UI primitives
  forms/            # Form components
  inspection/       # Inspection-specific components
hooks/
  useAuth.ts        # Auth state + navigation guard
  useProperties.ts  # Properties CRUD with local state
  useActionState.ts # React 19 action state pattern
lib/
  supabase.ts       # Supabase client with SecureStore adapter (single export)
  theme.ts          # colors, spacing, typography — source of truth for all values
```

---

## Architecture

### Navigation (Expo Router)

Expo Router mirrors Next.js App Router: file system = route tree. Same mental model, different runtime.

```typescript
// Root layout: gates auth at the layout level
export default function RootLayout() {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="(auth)" />}
      <Stack.Screen name="property" />
      <Stack.Screen name="inspection" />
    </Stack>
  );
}
```

Dynamic routes: `useLocalSearchParams<{ id: string }>()` — typed equivalent of `useParams()` in Next.js.

`useSegments()` tells you which layout group you're in — use it in `useAuth` to redirect unauthenticated users without causing navigation race conditions.

### Supabase Client

One client for the entire mobile app — configured with `expo-secure-store` as the session storage adapter:

```typescript
// lib/supabase.ts
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,  // hardware-backed on iOS, Android Keystore
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,        // required for mobile — no URL-based OAuth callback
  },
});
```

`expo-secure-store` replaces cookies/localStorage. Hardware-backed on iOS (Secure Enclave), uses Android Keystore. Don't swap this for AsyncStorage — credentials need hardware protection.

### Auth Hook Pattern

```typescript
// hooks/useAuth.ts — handles session, navigation guard, and auth actions
const { user, loading, signIn, signUp, signOut } = useAuth();
```

Navigation guard lives inside `useAuth` via `useEffect` on `[user, loading, segments]`. This keeps route protection co-located with auth state, not scattered across screens.

---

## Design System

### Theme Constants (`lib/theme.ts`) — Always Use These

```typescript
import { colors, spacing, typography } from '@/lib/theme';

// Never hardcode — always reference theme
style={{ color: colors.primary[600], padding: spacing.md }}
```

Key values:
- `colors.primary[600]` = #2563eb (brand blue)
- `spacing`: xs=4, sm=8, md=16, lg=24, xl=32
- Tab bar: active = `colors.primary[600]`, inactive = `colors.gray[500]`, bg = white

### Card Shadows (Cross-Platform)

```typescript
// Always include both iOS shadow props and Android elevation
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,   // Android only — iOS ignores this
  },
});
```

### UX Principles

- **Camera and photo picker must feel instant.** Show a preview placeholder immediately; upload in the background. Never block the UI waiting for Supabase Storage.
- **Empty states = onboarding moments.** "No properties" → CTA to add the first one.
- **Error states = next action.** Tell users what went wrong and what to tap next.
- **Loading: skeleton screens or subtle activity indicators.** Never frozen UI.
- Compress photos at upload time: quality 0.8, this is the right trade-off between size and visual quality for inspection evidence.

---

## Native Feature Patterns

### Camera

```typescript
import { Camera, CameraView } from 'expo-camera';
const [permission, requestPermission] = Camera.useCameraPermissions();
// Check permission before rendering CameraView — request if not granted
const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
```

### Image Picker

```typescript
import * as ImagePicker from 'expo-image-picker';
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
  allowsMultipleSelection: true,
  selectionLimit: 10,
});
if (!result.canceled) { /* result.assets[].uri */ }
```

### File System

```typescript
import * as FileSystem from 'expo-file-system';
// Read as base64 for Supabase Storage upload
const base64 = await FileSystem.readAsStringAsync(localUri, {
  encoding: FileSystem.EncodingType.Base64,
});
```

### Sharing / PDF Export

```typescript
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
const { uri } = await Print.printToFileAsync({ html: reportHtml });
await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
```

---

## Photo Upload Flow (Mobile)

```
1. Capture via camera (expo-camera) or picker (expo-image-picker) → local URI
2. Read as base64 (expo-file-system)
3. Upload to Supabase Storage: {user_id}/{inspection_id}/{timestamp}.jpg
4. Insert row in inspection_photos: { inspection_id, storage_path, room_type, caption }
5. Display using getPublicUrl(storage_path)
```

EXIF metadata: preserve it — don't strip on upload. GPS and timestamp data in EXIF is part of the legal evidence chain.

---

## Build & Deployment

```bash
# Development
npx expo start               # Expo Go or dev client
npx expo run:ios             # iOS simulator (requires Xcode)
npx expo run:android         # Android emulator

# EAS builds
eas build --platform ios --profile preview      # simulator .app
eas build --platform android --profile preview  # APK for testing
eas build --platform all --profile production   # App Store + Play Store

# OTA updates (no app store review required)
eas update --branch production --message "Description"
```

---

## Mental Models (Expo / React Native for Senior Devs)

**Expo Router = Next.js App Router for mobile** — same file-based routing, same layout group concept (`(auth)/`, `(tabs)/`). The main difference: no URL bar, so navigation state is managed internally by the router, not reflected in a URL. `useLocalSearchParams` is `useSearchParams`; `useSegments` has no direct Next.js equivalent.

**`detectSessionInUrl: false`** — on web, OAuth completes by redirecting back to a URL with a `code` param, which Supabase reads. On mobile, that mechanism doesn't exist (no browser URL bar). Supabase uses deep links instead. Setting this to `false` prevents Supabase from trying and failing to read URL params on mobile.

**`expo-secure-store` vs `AsyncStorage`** — `AsyncStorage` is unencrypted. Session tokens are credentials. Always use SecureStore for auth data. For non-sensitive caching (e.g., UI preferences), AsyncStorage is fine.

**`StyleSheet.create()` vs inline styles** — `StyleSheet.create()` processes styles at module load time and passes integer IDs to the native layer instead of JS objects on every render. Prefer it for static styles. Inline styles are fine for dynamic values.

**Permissions must be declared in `app.config.ts`** — iOS `infoPlist` entries (camera, photo library) and Android `permissions` are baked into the binary at build time. Adding them after a build requires a new EAS build, not an OTA update. If a new feature needs a new permission, plan for a full build cycle.

**EAS vs Expo Go** — Expo Go is for quick iteration on pure JS/TS code. The moment you add a native module (camera, secure store, etc.) that isn't in Expo Go's default bundle, you need a dev client build via EAS. This project uses native modules, so use `eas build --profile development` for day-to-day development.

**OTA updates vs app store updates** — `eas update` pushes JS bundle changes without app store review (~minutes). Native code changes (new permissions, new native modules, app.config.ts changes) require a full `eas build` + store submission (~days). Categorize every change as JS-only or native before deciding the release path.
