/**
 * Register Screen - React 19 Pattern
 *
 * Features:
 * - Email/password registration
 * - Google SSO (OAuth)
 * - useActionState for form handling
 * - Confirm password validation
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
  Modal,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { registerSchema, formatZodError, APP_CONFIG, getProvinceOptions } from '@propertycheck/shared';
import { useActionState } from '../../hooks';
import { useTranslation } from '../../contexts';
import { colors, semantic, spacing, radius, shadows } from '../../lib/theme';

// Get province options for the dropdown
const PROVINCE_OPTIONS = getProvinceOptions();

// Required for Google OAuth
WebBrowser.maybeCompleteAuthSession();

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
  province: string;
  onSuccess: () => void;
  t: (key: string) => string;
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
    const supabase = getMobileSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.full_name,
          province: payload.province,
        },
      },
    });

    if (error) {
      Alert.alert(payload.t('auth.register.errors.registrationFailed'), error.message);
      return { errors: {}, success: false };
    }

    // Show success alert and call success callback
    Alert.alert(
      payload.t('auth.register.success.title'),
      payload.t('auth.register.success.message'),
      [{ text: payload.t('common.ok'), onPress: payload.onSuccess }]
    );

    return { errors: {}, success: true };
  } catch {
    Alert.alert(payload.t('alerts.error'), payload.t('auth.register.errors.unexpectedError'));
    return { errors: {}, success: false };
  }
}

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [province, setProvince] = useState('');
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // useActionState for form handling
  const [state, dispatch, isPending] = useActionState(registerAction, initialState);

  const handleSubmit = () => {
    dispatch({
      fullName,
      email,
      password,
      confirmPassword,
      province,
      onSuccess: () => router.back(),
      t,
    });
  };

  // Get selected province label
  const selectedProvinceLabel = PROVINCE_OPTIONS.find(p => p.value === province)?.label || t('auth.register.provincePlaceholder');

  // Google OAuth Sign Up
  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      const supabase = getMobileSupabaseClient();

      const redirectUri = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        Alert.alert(t('alerts.error'), error.message);
        return;
      }

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const accessToken = url.searchParams.get('access_token');
          const refreshToken = url.searchParams.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }
    } catch (err) {
      console.error('Google sign up error:', err);
      Alert.alert(t('alerts.error'), t('auth.register.errors.googleSignUpFailed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading = isPending || googleLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Ionicons name="shield-checkmark" size={26} color={semantic.primaryContrast} />
          </View>
          <Text style={styles.title}>{t('auth.register.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.register.subtitle', { appName: APP_CONFIG.name })}</Text>
        </View>

        {/* Google Sign Up Button */}
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignUp}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color={semantic.fg} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color={semantic.fg} />
              <Text style={styles.googleButtonText}>{t('auth.register.continueWithGoogle')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('common.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.register.fullNameLabel')}</Text>
            <TextInput
              style={[styles.input, state.errors.full_name && styles.inputError]}
              placeholder={t('auth.register.fullNamePlaceholder')}
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
            <Text style={styles.label}>{t('auth.register.emailLabel')}</Text>
            <TextInput
              style={[styles.input, state.errors.email && styles.inputError]}
              placeholder={t('auth.register.emailPlaceholder')}
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
            <Text style={styles.label}>{t('auth.register.passwordLabel')}</Text>
            <TextInput
              style={[styles.input, state.errors.password && styles.inputError]}
              placeholder={t('auth.register.passwordPlaceholder')}
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
            <Text style={styles.label}>{t('auth.register.confirmPasswordLabel')}</Text>
            <TextInput
              style={[styles.input, state.errors.confirmPassword && styles.inputError]}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.register.provinceLabel')}</Text>
            <TouchableOpacity
              style={[styles.input, styles.selectInput, state.errors.province && styles.inputError]}
              onPress={() => setShowProvincePicker(true)}
              disabled={isPending}
            >
              <Text style={[styles.selectText, !province && styles.selectPlaceholder]}>
                {selectedProvinceLabel}
              </Text>
              <Ionicons name="chevron-down" size={20} color={semantic.fgMuted} />
            </TouchableOpacity>
            {state.errors.province && (
              <Text style={styles.errorText}>{state.errors.province}</Text>
            )}
          </View>

          {/* Province Picker Modal */}
          <Modal
            visible={showProvincePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowProvincePicker(false)}
          >
            <TouchableOpacity
              style={styles.pickerOverlay}
              activeOpacity={1}
              onPress={() => setShowProvincePicker(false)}
            >
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>{t('auth.register.selectProvince')}</Text>
                  <TouchableOpacity onPress={() => setShowProvincePicker(false)} hitSlop={8}>
                    <Ionicons name="close" size={24} color={semantic.fgMuted} />
                  </TouchableOpacity>
                </View>
                {PROVINCE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerOption,
                      province === option.value && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setProvince(option.value);
                      setShowProvincePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        province === option.value && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {province === option.value && (
                      <Ionicons name="checkmark" size={20} color={semantic.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator color={semantic.primaryContrast} />
            ) : (
              <Text style={styles.buttonText}>{t('auth.register.createAccountButton')}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            {t('auth.register.terms')}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.register.hasAccount')}</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>{t('auth.register.signInLink')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: semantic.canvas },
  content: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: semantic.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.primary,
  },
  title: { fontSize: 28, fontWeight: '700', color: semantic.fg, letterSpacing: -0.4, marginBottom: 6 },
  subtitle: { fontSize: 15, color: semantic.fgMuted, textAlign: 'center' },
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
  terms: { fontSize: 12, color: semantic.fgMuted, textAlign: 'center', marginTop: spacing.md, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: semantic.fgMuted, fontSize: 14 },
  link: { color: semantic.primary, fontSize: 14, fontWeight: '600' },
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 16, color: semantic.fg },
  selectPlaceholder: { color: semantic.fgSubtle },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 21, 36, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerContainer: {
    backgroundColor: semantic.card,
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    ...shadows.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: semantic.line,
  },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: semantic.fg },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: semantic.line,
  },
  pickerOptionSelected: { backgroundColor: colors.primary[50] },
  pickerOptionText: { fontSize: 16, color: semantic.fg },
  pickerOptionTextSelected: { color: semantic.primary, fontWeight: '600' },
});
