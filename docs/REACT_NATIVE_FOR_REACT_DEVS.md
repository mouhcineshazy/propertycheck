# React Native for Senior React Developers
*A mental model transfer guide — written for someone with 6 years of React and a Java background*

---

## The Core Mental Model Shift

React Native is **not a web app wrapped in a WebView**. It renders real native UI components (UIView on iOS, android.view.View on Android) using the same JavaScript you know from React. The bridge between your JS logic and native UI is the key thing to understand.

Think of it like this: React DOM maps JSX to HTML elements. React Native maps JSX to **native platform UI components**. Same React model, different output target.

```
React (web):   JSX → Virtual DOM → React DOM → real HTML DOM elements
React Native:  JSX → Virtual DOM → Native Bridge → iOS UIView / Android View
```

Your component logic, hooks, state, context — all identical. What changes is the renderer and the environment.

---

## Part 1: What Is Identical to React

### Everything About Components

```tsx
// This is 100% standard React. Zero differences.
function InspectionCard({ title, date }: { title: string; date: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
      <Text>{title}</Text>
      {expanded && <Text>{date}</Text>}
    </TouchableOpacity>
  );
}
```

- `useState`, `useEffect`, `useReducer`, `useContext`, `useMemo`, `useCallback` — identical
- `useRef` — identical, including for storing mutable values (not just DOM refs)
- Custom hooks — identical pattern
- Context API — identical
- React.memo, React.lazy — identical (lazy has limitations but the API is the same)
- Error boundaries — identical

### The Hook Rules Are the Same

No hooks in conditionals, no hooks in loops, hooks must be at the top level. Same rules, same reasons.

### Event System Differences Are Minimal

Where React web uses `onClick`, React Native uses `onPress`. Where web uses `onChange` on inputs, RN uses `onChangeText`. The mental model is the same: handler fires, you update state, component re-renders.

### Async/Await, Promises, Fetch

All standard. The JS runtime is the same V8/Hermes engine. `fetch`, `async/await`, `Promise.all` — no surprises.

---

## Part 2: What Looks Similar But Behaves Differently

### There Is No CSS

This is the biggest shift. There is no stylesheet, no class names, no cascading, no inheritance. Styling in React Native is done with JavaScript objects, not CSS.

```tsx
// Web React (CSS):
<div className="card shadow-md rounded-lg p-4">

// React Native:
<View style={{ 
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,  // Android only — iOS ignores this
}}>
```

Key differences:
- **No inheritance**: unlike CSS, parent styles do not cascade to children. `color` on a `View` does not affect `Text` inside it.
- **No shorthand**: `padding: 16` works, but `border: '1px solid #ccc'` doesn't — you need `borderWidth: 1, borderColor: '#ccc', borderStyle: 'solid'`.
- **Flexbox is default**: every `View` is a flex container by default with `flexDirection: 'column'`. This is different from web where block layout is default. In RN, you're always in flex.
- **No CSS units**: no `px`, `em`, `rem`, `%` (mostly). Numbers are density-independent pixels (dp on Android, points on iOS). `width: 100` means "100 dp", which looks the same physical size on all screens regardless of pixel density.
- **`StyleSheet.create()`**: processes styles at module load time and passes IDs to the native layer. Use it for static styles. Inline objects are fine for dynamic values but slightly less efficient.

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  // shadow must be BOTH sets — iOS and Android don't use the same props
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

<View style={[styles.card, styles.shadow]}>  {/* arrays merge styles */}
```

### HTML Elements → React Native Primitives

| Web | React Native | Notes |
|-----|-------------|-------|
| `<div>` | `<View>` | Layout container. No text directly inside View. |
| `<span>`, `<p>`, `<h1>` | `<Text>` | All text must be inside `<Text>`. |
| `<img>` | `<Image>` | Needs `source={{ uri: '...' }}` for remote images |
| `<input>` | `<TextInput>` | `onChangeText` instead of `onChange` |
| `<button>` | `<TouchableOpacity>` or `<Pressable>` | `onPress` instead of `onClick` |
| `<a>` | `<TouchableOpacity>` + navigation | No href — use the router |
| `<ul><li>` | `<FlatList>` | Virtualized list — critical for performance |
| `<select>` | `<Picker>` or custom modal | No native select dropdown |
| `<form>` | No equivalent | Just wrap inputs in a `<View>` |

**The rule that trips everyone up**: You **cannot** put raw text strings directly inside a `<View>`. All text must be inside a `<Text>`.

```tsx
// WRONG — crashes at runtime
<View>Hello world</View>

// CORRECT
<View><Text>Hello world</Text></View>
```

### Scroll Is Manual

On web, the browser handles overflow scroll automatically. In React Native, nothing scrolls by default. You must explicitly wrap content in `<ScrollView>` (for short lists) or `<FlatList>` (for long/infinite lists).

```tsx
// Short content: ScrollView
<ScrollView>
  <Text>Lots of content...</Text>
</ScrollView>

// Long/dynamic lists: FlatList (virtualized — only renders what's visible)
<FlatList
  data={properties}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <PropertyCard property={item} />}
/>
```

**From your Java background**: `FlatList` is conceptually equivalent to `RecyclerView` in Android. It recycles off-screen cells. `ScrollView` is like a simple `ScrollView` — fine for small content, not for large lists.

### `useEffect` Cleanup Is More Critical

On the web, most effects clean up when the user navigates away. In React Native, the app runs continuously in the background. If you subscribe to something in `useEffect` without returning a cleanup function, that subscription accumulates across screen navigations. This causes memory leaks and bugs that don't happen in web apps.

```tsx
useEffect(() => {
  const subscription = supabase
    .channel('inspections')
    .on('postgres_changes', { event: '*', schema: 'public' }, handler)
    .subscribe();

  // This cleanup is mandatory in RN — without it you get multiple listeners
  return () => subscription.unsubscribe();
}, []);
```

---

## Part 3: What Doesn't Exist on Web (Completely New)

### The Platform Doesn't Have a Browser

No `window`, no `document`, no `localStorage`, no `cookies`, no `navigator.geolocation` (directly). Everything that in web development you access via browser globals doesn't exist. Instead:

| Web browser API | React Native equivalent |
|----------------|------------------------|
| `localStorage` | `AsyncStorage` (unencrypted) or `expo-secure-store` (encrypted) |
| `document.cookie` | `expo-secure-store` for auth tokens |
| `window.location` | Expo Router's navigation API |
| `navigator.camera` | `expo-camera` (requires hardware permission) |
| `navigator.geolocation` | `expo-location` (requires hardware permission) |
| `window.open()` | `Linking.openURL()` |
| `FileReader` | `expo-file-system` |
| `URL.createObjectURL()` | No equivalent — URIs are file:// paths |

### Permissions

Native apps must explicitly request hardware access from the user. On web, the browser handles this. In React Native, your code must:
1. Declare the permission in `app.config.ts` (baked into the binary — cannot change without rebuilding)
2. Request it at runtime using the permission API
3. Handle the case where the user denies it

```typescript
// Camera: declare in app.config.ts
plugins: [
  ['expo-camera', { cameraPermission: 'Allow PropertyCheck to access your camera.' }]
]

// Camera: request at runtime
const [permission, requestPermission] = Camera.useCameraPermissions();

if (!permission?.granted) {
  return <Button title="Allow Camera" onPress={requestPermission} />;
}
```

**From your Java background**: this is exactly like Android's `ContextCompat.checkSelfPermission()` + `ActivityCompat.requestPermissions()` pattern, just with a React hook wrapper.

### Navigation Is Router-Based, Not URL-Based

On web, you navigate to a URL and the browser loads a page. The URL is the source of truth. In React Native (with Expo Router), navigation is stack-based with the file system as the route definition.

```
// File: app/(tabs)/index.tsx
// This IS the route — like Next.js. Navigate to it with:
router.push('/(tabs)');
router.push('/property/abc123');

// Get params from the URL-like path:
const { id } = useLocalSearchParams<{ id: string }>();
```

Key difference from web: there is no browser back button. Native apps have a hardware back button (Android) or a swipe gesture (iOS). Expo Router manages this for you, but understanding the stack model matters.

### App Lifecycle (Background / Foreground)

Web apps don't have a lifecycle. Native apps do. The OS can kill, suspend, or resume your app.

```typescript
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      // App came back from background — refresh data
    }
  });
  return () => subscription.remove();
}, []);
```

This matters for PropertyCheck: if the user takes photos, puts the app in background for 10 minutes, then comes back — you need to handle session refresh and stale data.

### Native Modules and the Build Step

On web, `npm install some-package` → import → works. In React Native, packages that wrap native code (camera, file system, secure storage) require a **build step**. The JavaScript isn't enough — native Objective-C/Swift/Kotlin code gets compiled into the binary.

This has a major consequence: **you cannot add or update native modules with an OTA update**. OTA updates (via `eas update`) only push the JavaScript bundle. Native code changes require a full `eas build` + app store submission.

Categorize every change before deciding the release path:
- JS only (new screen, bug fix, UI change) → OTA update via `eas update` (~minutes)
- New native module or permission → full build + store submission (~days for App Store review)

**From your Java background**: think of the compiled Java/Kotlin code in the APK vs the interpreted JS at runtime. You can hot-swap the JS but not the compiled native layer.

---

## Part 4: The Expo Layer

This project uses Expo, which adds a managed layer on top of bare React Native. Think of Expo as a curated set of native modules + build tooling + a runtime.

### Expo SDK vs Bare React Native

With bare React Native, you write Objective-C/Swift/Kotlin directly for native features. With Expo, you import pre-built modules:

```typescript
// Expo way (this project)
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
```

All of these are maintained by the Expo team, tested against each other, and updated together. The tradeoff: less control, much faster development.

### Expo Router

Expo Router is the navigation solution in this project. It's a file-system router built on top of React Navigation (the most popular navigation library). It gives you the Next.js mental model: your file structure is your route tree.

```
app/
  _layout.tsx          # Root layout (like app/layout.tsx in Next.js)
  (auth)/
    _layout.tsx        # Auth group layout
    login.tsx          # /login
    register.tsx       # /register
  (tabs)/
    _layout.tsx        # Tab bar layout
    index.tsx          # / (home tab)
    settings.tsx       # /settings
  property/
    [id].tsx           # /property/:id
    new.tsx            # /property/new
```

The API differences from Next.js:
- `useLocalSearchParams<T>()` instead of `useSearchParams()`
- `useRouter()` for navigation (same name, slightly different API)
- `useSegments()` to know which layout group you're in (no Next.js equivalent)
- `Link` component exists but `router.push()` is more common in mobile

### EAS (Expo Application Services)

EAS is Expo's cloud build and deployment service. You don't run Xcode or Android Studio locally for production builds — EAS builds in the cloud.

```bash
# Build for TestFlight (iOS beta)
eas build --platform ios --profile preview

# Build for production (App Store)
eas build --platform ios --profile production

# Push a JS-only update (no build needed)
eas update --branch production --message "Fix login bug"
```

**From your Java backend background**: think of EAS as a CI/CD pipeline that also handles code signing and app store submission, similar to GitHub Actions + Fastlane.

---

## Part 5: Patterns Used in This Project

### `useSyncExternalStore` in `useAuth` (Modern React 19)

The `useAuth` hook in `apps/mobile/hooks/useAuth.ts` uses `useSyncExternalStore` instead of the common `useEffect + useState` pattern. This is worth understanding.

```typescript
// Common (but flawed) pattern:
function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);  // Causes tearing: render before state updates
    });
    return () => data.subscription.unsubscribe();
  }, []);
  
  return user;
}

// This project's pattern (correct):
const store = {
  subscribe: (callback) => {
    const { data } = supabase.auth.onAuthStateChange(() => callback());
    return () => data.subscription.unsubscribe();
  },
  getSnapshot: () => currentAuthState,
};

function useAuth() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
```

`useSyncExternalStore` is React's official API for subscribing to external stores. It guarantees consistency: the snapshot is always in sync with the render, eliminating the "tearing" problem where different components see different values of the same external state during a single render pass.

**From your Java background**: this is analogous to using a synchronized observer pattern vs an unsynchronized one. `useSyncExternalStore` is the thread-safe version.

### Error Handling Pattern in `api.ts`

```typescript
// Functions return { data, error } tuples — not throw/catch at the call site
export async function fetchProperties(): Promise<{
  data: Property[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase.from('properties').select('*');
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Failed to fetch properties' };
  }
}

// Call site:
const { data, error } = await fetchProperties();
if (error) { /* handle */ }
```

This is the Supabase pattern and it's good for React Native because it keeps error handling explicit and co-located with the UI that needs to show the error. Compare to the Java world: it's like using `Optional<T>` or a `Result<T, E>` type instead of throwing checked exceptions.

### Supabase Client — Singleton with Lazy Init

```typescript
let mobileClient: TypedSupabaseClient | null = null;

export function getMobileSupabaseClient(): TypedSupabaseClient {
  if (mobileClient) return mobileClient;
  mobileClient = createClient<Database>(url, anonKey, { ... });
  return mobileClient;
}
```

**From your Java background**: this is the singleton pattern with lazy initialization — the same as `getInstance()` in a singleton class. The React Native reason: creating a Supabase client is expensive and the auth state listener must be attached to a single instance, not recreated on every render.

---

## Part 6: The Biggest Gotchas for Web React Developers

1. **`Text` must wrap all strings.** No exceptions. A raw string in a `View` crashes immediately.

2. **Styling does not inherit.** Set `color` on `View`? Child `Text` doesn't get it. You must style `Text` directly.

3. **Shadow requires 5 props, not 1.** iOS uses `shadowColor/shadowOffset/shadowOpacity/shadowRadius`. Android uses `elevation`. You need both sets.

4. **No flexbox `display`**. `display: 'flex'` is redundant — everything is flex by default. `display: 'none'` works but you'll more often use conditional rendering.

5. **`ScrollView` children have no automatic height.** If your `ScrollView` content appears cut off, the parent needs a defined height or `flex: 1`.

6. **`TouchableOpacity` vs `Pressable`**: `TouchableOpacity` reduces opacity on press (simple, predictable). `Pressable` is more powerful — it accepts a function for styles so you can change background color on press. Use `Pressable` for custom press states, `TouchableOpacity` for anything else.

7. **Images need explicit dimensions** unless you're using `flex: 1`. Remote images in `<Image source={{ uri: '...' }}>` won't render without `style={{ width: X, height: Y }}` unless you specify `resizeMode` and the container constrains it.

8. **`useEffect` cleanup is not optional.** On web, navigating away from a page destroys the component and cleans up automatically. In React Native, the component may be re-mounted (not destroyed) when you navigate back. Subscriptions stack up without cleanup.

9. **Hot reload vs full reload.** `r` in the Expo CLI reloads JS only. Shaking the device opens dev menu. When you change `app.config.ts` or add a new native module, you need a full rebuild — no hot reload will help.

10. **The keyboard covers your inputs.** On mobile, the software keyboard pushes up or overlaps the screen. Wrap your forms in `<KeyboardAvoidingView behavior="padding">` to prevent the keyboard from covering inputs. There is no web equivalent — this concept doesn't exist in browser land.
