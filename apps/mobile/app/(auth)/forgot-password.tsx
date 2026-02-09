/**
 * Forgot Password Screen - React 19 Pattern
 *
 * Features:
 * - Email input for password reset
 * - useActionState for form handling
 * - Success/error feedback
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
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { z } from 'zod';
import { formatZodError } from '@propertycheck/shared';
import { useActionState } from '../../hooks';
import { useTranslation } from '../../contexts';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Type for action state
type ForgotPasswordState = {
  errors: Record<string, string>;
  success: boolean;
};

const initialState: ForgotPasswordState = {
  errors: {},
  success: false,
};

// Forgot password action
async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  payload: { email: string; onSuccess: () => void; t: (key: string) => string }
): Promise<ForgotPasswordState> {
  const result = forgotPasswordSchema.safeParse({ email: payload.email });

  if (!result.success) {
    return { errors: formatZodError(result.error), success: false };
  }

  try {
    const supabase = getMobileSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: 'propertycheck://auth/reset-password',
    });

    if (error) {
      Alert.alert(payload.t('alerts.error'), error.message);
      return { errors: {}, success: false };
    }

    Alert.alert(
      payload.t('auth.forgotPassword.success.title'),
      payload.t('auth.forgotPassword.success.message'),
      [{ text: payload.t('common.ok'), onPress: payload.onSuccess }]
    );

    return { errors: {}, success: true };
  } catch {
    Alert.alert(payload.t('alerts.error'), payload.t('auth.login.errors.unexpectedError'));
    return { errors: {}, success: false };
  }
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [state, dispatch, isPending] = useActionState(forgotPasswordAction, initialState);

  const handleSubmit = () => {
    dispatch({
      email,
      onSuccess: () => router.back(),
      t,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="lock-closed-outline" size={48} color="#2563eb" />
          <Text style={styles.title}>{t('auth.forgotPassword.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.forgotPassword.subtitle')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.forgotPassword.emailLabel')}</Text>
            <TextInput
              style={[styles.input, state.errors.email && styles.inputError]}
              placeholder={t('auth.forgotPassword.emailPlaceholder')}
              placeholderTextColor="#999"
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

          <TouchableOpacity
            style={[styles.button, isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.forgotPassword.sendResetLink')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.forgotPassword.backToLogin')} </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>{t('auth.login.signInButton')}</Text>
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
  },
  backButton: {
    marginTop: 16,
    marginBottom: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
    color: '#1a1a1a',
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
