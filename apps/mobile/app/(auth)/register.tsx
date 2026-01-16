/**
 * Register Screen - React 19 Pattern
 *
 * Uses useActionState for form handling with automatic pending state.
 * Same pattern as login - action defined outside, isPending from useTransition.
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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getSupabaseBrowserClient } from '@propertycheck/database';
import { registerSchema, formatZodError } from '@propertycheck/shared';
import { useActionState } from '../../hooks';

// Type for action state
type RegisterState = {
  errors: Record<string, string>;
  success: boolean;
};

// Initial state
const initialState: RegisterState = {
  errors: {},
  success: false,
};

// Register payload type
type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  onSuccess: () => void;
};

// Register action - defined outside component
async function registerAction(
  _prevState: RegisterState,
  payload: RegisterPayload
): Promise<RegisterState> {
  // Validate input
  const result = registerSchema.safeParse({
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
    full_name: payload.fullName,
  });

  if (!result.success) {
    return { errors: formatZodError(result.error), success: false };
  }

  // Attempt registration
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.full_name,
        },
      },
    });

    if (error) {
      Alert.alert('Registration Failed', error.message);
      return { errors: {}, success: false };
    }

    // Show success alert and call success callback
    Alert.alert(
      'Check Your Email',
      'We sent you a confirmation link. Please check your email to verify your account.',
      [{ text: 'OK', onPress: payload.onSuccess }]
    );

    return { errors: {}, success: true };
  } catch {
    Alert.alert('Error', 'An unexpected error occurred');
    return { errors: {}, success: false };
  }
}

export default function RegisterScreen() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // useActionState for form handling
  const [state, dispatch, isPending] = useActionState(registerAction, initialState);

  const handleSubmit = () => {
    dispatch({
      fullName,
      email,
      password,
      confirmPassword,
      onSuccess: () => router.back(),
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, state.errors.full_name && styles.inputError]}
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              editable={!isPending}
            />
            {state.errors.full_name && (
              <Text style={styles.errorText}>{state.errors.full_name}</Text>
            )}
          </View>

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
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!isPending}
            />
            {state.errors.password && (
              <Text style={styles.errorText}>{state.errors.password}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, state.errors.confirmPassword && styles.inputError]}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!isPending}
            />
            {state.errors.confirmPassword && (
              <Text style={styles.errorText}>{state.errors.confirmPassword}</Text>
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
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            By creating an account, you agree to our Terms of Service and Privacy
            Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
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
  terms: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
