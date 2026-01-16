/**
 * App Entry Point
 *
 * Redirects to the appropriate screen based on auth state.
 * The actual redirect logic is handled in _layout.tsx
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // This will be intercepted by _layout.tsx auth logic
  // If user is authenticated, they'll go to (tabs)
  // If not, they'll go to (auth)/login
  return <Redirect href="/(tabs)" />;
}
