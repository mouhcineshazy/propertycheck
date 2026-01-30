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
    });
  };

  // Get selected province label
  const selectedProvinceLabel = PROVINCE_OPTIONS.find(p => p.value === province)?.label || 'Select your province';

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
        Alert.alert('Error', error.message);
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
      Alert.alert('Error', 'Failed to sign up with Google');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join {APP_CONFIG.name} today</Text>
        </View>

        {/* Google Sign Up Button */}
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignUp}
          disabled={isLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color="#1a1a1a" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#1a1a1a" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Province</Text>
            <TouchableOpacity
              style={[styles.input, styles.selectInput, state.errors.province && styles.inputError]}
              onPress={() => setShowProvincePicker(true)}
              disabled={isPending}
            >
              <Text style={[styles.selectText, !province && styles.selectPlaceholder]}>
                {selectedProvinceLabel}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
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
                  <Text style={styles.pickerTitle}>Select Province</Text>
                  <TouchableOpacity onPress={() => setShowProvincePicker(false)}>
                    <Ionicons name="close" size={24} color="#666" />
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
                      <Ionicons name="checkmark" size={20} color="#2563eb" />
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </Link>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
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
  terms: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
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
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectPlaceholder: {
    color: '#999',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  pickerOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
});
