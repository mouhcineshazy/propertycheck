/**
 * Forgot Password Screen - React 19 Pattern
 * Trust Ink theme tokens (lib/theme.ts).
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { z } from 'zod';
import { formatZodError } from '@propertycheck/shared';
import { useActionState } from '../../hooks';
import { useTranslation } from '../../contexts';
import { useTheme, useThemedStyles, spacing, radius, type AppTheme } from '../../lib/theme';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordState = { errors: Record<string, string>; success: boolean };
const initialState: ForgotPasswordState = { errors: {}, success: false };

async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  payload: { email: string; onSuccess: () => void; t: (key: string) => string }
): Promise<ForgotPasswordState> {
  const result = forgotPasswordSchema.safeParse({ email: payload.email });
  if (!result.success) return { errors: formatZodError(result.error), success: false };
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
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { semantic } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [email, setEmail] = useState('');
  const [state, dispatch, isPending] = useActionState(forgotPasswordAction, initialState);

  const handleSubmit = () => dispatch({ email, onSuccess: () => router.back(), t });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={semantic.fg} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed-outline" size={30} color={semantic.primary} />
          </View>
          <Text style={styles.title}>{t('auth.forgotPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.forgotPassword.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.forgotPassword.emailLabel')}</Text>
            <TextInput
              style={[styles.input, state.errors.email && styles.inputError]}
              placeholder={t('auth.forgotPassword.emailPlaceholder')}
              placeholderTextColor={semantic.fgSubtle}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isPending}
            />
            {state.errors.email && <Text style={styles.errorText}>{state.errors.email}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isPending}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator color={semantic.primaryContrast} />
            ) : (
              <Text style={styles.buttonText}>{t('auth.forgotPassword.sendResetLink')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.forgotPassword.backToLogin')} </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.link}>{t('auth.login.signInButton')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ semantic, shadows }: AppTheme) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: semantic.canvas },
  content: { flex: 1, padding: spacing.lg },
  backButton: { marginBottom: spacing.lg, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: semantic.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: '700', color: semantic.fg, letterSpacing: -0.4, marginBottom: 8 },
  subtitle: { fontSize: 15, color: semantic.fgMuted, textAlign: 'center', lineHeight: 22 },
  form: { gap: spacing.md },
  inputContainer: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: semantic.fg, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: semantic.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    backgroundColor: semantic.card,
    color: semantic.fg,
  },
  inputError: { borderColor: semantic.danger },
  errorText: { fontSize: 12, color: semantic.danger, marginTop: spacing.xs },
  button: {
    backgroundColor: semantic.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
    ...shadows.primary,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: semantic.primaryContrast, fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: semantic.fgMuted, fontSize: 14 },
  link: { color: semantic.primary, fontSize: 14, fontWeight: '600' },
});
