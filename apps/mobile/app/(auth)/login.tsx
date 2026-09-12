/**
 * Login Screen - React 19 Pattern
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
import { Link, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { loginSchema, formatZodError, APP_CONFIG } from '@propertycheck/shared';
import { useActionState } from '../../hooks';
import { useTranslation } from '../../contexts';
import { semantic, spacing, radius, shadows } from '../../lib/theme';

WebBrowser.maybeCompleteAuthSession();

type LoginState = { errors: Record<string, string> };
const initialState: LoginState = { errors: {} };

async function loginAction(
  _prevState: LoginState,
  payload: { email: string; password: string; t: (key: string) => string }
): Promise<LoginState> {
  const result = loginSchema.safeParse(payload);
  if (!result.success) return { errors: formatZodError(result.error) };
  try {
    const supabase = getMobileSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });
    if (error) {
      Alert.alert(payload.t('auth.login.errors.loginFailed'), error.message);
      return { errors: {} };
    }
    return { errors: {} };
  } catch {
    Alert.alert(payload.t('alerts.error'), payload.t('auth.login.errors.unexpectedError'));
    return { errors: {} };
  }
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [state, dispatch, isPending] = useActionState(loginAction, initialState);

  const handleSubmit = () => dispatch({ email, password, t });

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const supabase = getMobileSupabaseClient();
      const redirectUri = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (error) {
        Alert.alert(t('alerts.error'), error.message);
        return;
      }
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const accessToken = url.searchParams.get('access_token');
          const refreshToken = url.searchParams.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          }
        }
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      Alert.alert(t('alerts.error'), t('auth.login.errors.googleSignInFailed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading = isPending || googleLoading;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        {/* Brand header */}
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Ionicons name="shield-checkmark" size={30} color={semantic.primaryContrast} />
          </View>
          <Text style={styles.title}>{APP_CONFIG.name}</Text>
          <Text style={styles.subtitle}>{APP_CONFIG.tagline}</Text>
        </View>

        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color={semantic.fg} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color={semantic.fg} />
              <Text style={styles.googleButtonText}>{t('auth.login.continueWithGoogle')}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('common.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.login.emailLabel')}</Text>
            <TextInput
              style={[styles.input, state.errors.email && styles.inputError]}
              placeholder={t('auth.login.emailPlaceholder')}
              placeholderTextColor={semantic.fgSubtle}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
            />
            {state.errors.email && <Text style={styles.errorText}>{state.errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('auth.login.passwordLabel')}</Text>
              <Link href={'/(auth)/forgot-password' as Href} asChild>
                <TouchableOpacity hitSlop={8}>
                  <Text style={styles.forgotLink}>{t('auth.login.forgotPassword')}</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <TextInput
              style={[styles.input, state.errors.password && styles.inputError]}
              placeholder={t('auth.login.passwordPlaceholder')}
              placeholderTextColor={semantic.fgSubtle}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
            {state.errors.password && <Text style={styles.errorText}>{state.errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator color={semantic.primaryContrast} />
            ) : (
              <Text style={styles.buttonText}>{t('auth.login.signInButton')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.login.noAccount')} </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.link}>{t('auth.login.signUpLink')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: semantic.canvas },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: semantic.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.primary,
  },
  title: { fontSize: 30, fontWeight: '700', color: semantic.fg, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 15, color: semantic.fgMuted },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semantic.card,
    borderWidth: 1,
    borderColor: semantic.lineStrong,
    borderRadius: radius.md,
    padding: 14,
    gap: spacing.sm + 4,
    ...shadows.xs,
  },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: semantic.fg },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: semantic.line },
  dividerText: { marginHorizontal: spacing.md, color: semantic.fgSubtle, fontSize: 14 },
  form: { gap: spacing.md },
  inputContainer: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: semantic.fg },
  forgotLink: { fontSize: 14, fontWeight: '600', color: semantic.primary },
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
