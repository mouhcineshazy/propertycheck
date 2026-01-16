/**
 * Login Screen - React 19 Pattern
 *
 * Uses useActionState for form handling with automatic pending state.
 * Key changes from React 18:
 * - No manual isLoading/setIsLoading state
 * - Action function is defined outside component (no recreating on each render)
 * - isPending comes from useTransition (via useActionState)
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { getSupabaseBrowserClient } from '@propertycheck/database';
import { loginSchema, formatZodError } from '@propertycheck/shared';
import { APP_CONFIG } from '@propertycheck/shared';
import { useActionState } from '../../hooks';

// Type for action state
type LoginState = {
  errors: Record<string, string>;
};

// Initial state for the action
const initialState: LoginState = {
  errors: {},
};

// Login action - defined outside component (React 19 best practice)
// First param is previous state, second is the payload
async function loginAction(
  _prevState: LoginState,
  payload: { email: string; password: string }
): Promise<LoginState> {
  // Validate input using Zod
  const result = loginSchema.safeParse(payload);

  if (!result.success) {
    return { errors: formatZodError(result.error) };
  }

  // Attempt login
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      return { errors: {} };
    }

    // Success - auth state change triggers redirect in _layout.tsx
    return { errors: {} };
  } catch {
    Alert.alert('Error', 'An unexpected error occurred');
    return { errors: {} };
  }
}

export default function LoginScreen() {
  // Form input state (uncontrolled would be better but RN requires controlled)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // useActionState provides: [state, dispatch, isPending]
  // - state: current action result
  // - dispatch: function to trigger the action
  // - isPending: loading state (from useTransition internally)
  const [state, dispatch, isPending] = useActionState(loginAction, initialState);

  const handleSubmit = () => {
    dispatch({ email, password });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{APP_CONFIG.name}</Text>
          <Text style={styles.subtitle}>{APP_CONFIG.tagline}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, state.errors.email && styles.inputError]}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isPending}
            />
            {state.errors.email && (
              <Text style={styles.errorText}>{state.errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, state.errors.password && styles.inputError]}
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isPending}
            />
            {state.errors.password && (
              <Text style={styles.errorText}>{state.errors.password}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
});
