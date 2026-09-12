/**
 * Auth Group Layout
 *
 * Contains unauthenticated screens: login, register, password reset
 */

import { Stack } from 'expo-router';
import { semantic } from '../../lib/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: semantic.card,
        },
        headerTintColor: semantic.fg,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: semantic.canvas },
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
