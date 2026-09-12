/**
 * New Property Screen - React 19 Pattern
 *
 * - Create property with useActionState + Zod validation
 * - Trust Ink theme tokens (lib/theme.ts)
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { formatZodError } from '@propertycheck/shared';
import { useActionState } from '../../hooks';
import { createProperty } from '../../lib';
import { useTranslation } from '../../contexts';
import { useTheme, useThemedStyles, spacing, radius, type AppTheme } from '../../lib/theme';

const PROPERTY_TYPES = [
  { value: 'apartment', icon: 'business-outline' },
  { value: 'house', icon: 'home-outline' },
  { value: 'condo', icon: 'grid-outline' },
] as const;

const newPropertySchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters'),
  property_type: z.enum(['apartment', 'house', 'condo']),
  notes: z.string().optional(),
});

type NewPropertyState = { errors: Record<string, string> };
const initialState: NewPropertyState = { errors: {} };

async function createPropertyAction(
  _prevState: NewPropertyState,
  payload: {
    address: string;
    property_type: string;
    notes: string;
    onSuccess: () => void;
    t: (key: string) => string;
  }
): Promise<NewPropertyState> {
  const result = newPropertySchema.safeParse({
    address: payload.address,
    property_type: payload.property_type,
    notes: payload.notes || undefined,
  });

  if (!result.success) {
    return { errors: formatZodError(result.error) };
  }

  try {
    await createProperty({
      address: result.data.address,
      property_type: result.data.property_type,
      notes: result.data.notes,
    });
    payload.onSuccess();
    return { errors: {} };
  } catch (err) {
    const message = err instanceof Error ? err.message : payload.t('property.new.errors.createFailed');
    Alert.alert(payload.t('alerts.error'), message);
    return { errors: {} };
  }
}

export default function NewPropertyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { semantic } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<string>('apartment');
  const [notes, setNotes] = useState('');

  const [state, dispatch, isPending] = useActionState(createPropertyAction, initialState);

  const handleSubmit = () => {
    dispatch({
      address,
      property_type: propertyType,
      notes,
      t,
      onSuccess: () => {
        Alert.alert(t('common.success'), t('property.new.success'), [
          { text: t('common.ok'), onPress: () => router.back() },
        ]);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="close" size={24} color={semantic.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('property.new.title')}</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('property.new.addressLabel')} *</Text>
          <TextInput
            style={[styles.input, state.errors.address && styles.inputError]}
            placeholder={t('property.new.addressPlaceholder')}
            placeholderTextColor={semantic.fgSubtle}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
            autoComplete="street-address"
            editable={!isPending}
          />
          {state.errors.address && <Text style={styles.errorText}>{state.errors.address}</Text>}
        </View>

        {/* Property type */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('property.new.typeLabel')} *</Text>
          <View style={styles.typeGrid}>
            {PROPERTY_TYPES.map((type) => {
              const active = propertyType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeButton, active && styles.typeButtonActive]}
                  onPress={() => setPropertyType(type.value)}
                  disabled={isPending}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={type.icon}
                    size={22}
                    color={active ? semantic.primary : semantic.fgSubtle}
                  />
                  <Text style={[styles.typeButtonText, active && styles.typeButtonTextActive]}>
                    {t(`property.new.types.${type.value}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {state.errors.property_type && <Text style={styles.errorText}>{state.errors.property_type}</Text>}
        </View>

        {/* Notes */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('property.new.notesLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('property.new.notesPlaceholder')}
            placeholderTextColor={semantic.fgSubtle}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isPending}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color={semantic.primaryContrast} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color={semantic.primaryContrast} />
              <Text style={styles.submitButtonText}>{t('property.new.createButton')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ semantic, shadows }: AppTheme) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: semantic.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: semantic.card,
    borderBottomWidth: 1,
    borderBottomColor: semantic.line,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: semantic.fg },
  content: { padding: spacing.lg, paddingBottom: 40 },
  inputContainer: { marginBottom: spacing.lg },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: semantic.fg,
    marginBottom: spacing.sm,
  },
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
  textArea: { height: 110, paddingTop: 13 },
  errorText: { fontSize: 12, color: semantic.danger, marginTop: 6 },
  typeGrid: { flexDirection: 'row', gap: spacing.sm },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: semantic.lineStrong,
    backgroundColor: semantic.card,
  },
  typeButtonActive: {
    backgroundColor: semantic.primarySoft,
    borderColor: semantic.primary,
  },
  typeButtonText: { fontSize: 13, fontWeight: '600', color: semantic.fgMuted },
  typeButtonTextActive: { color: semantic.primary },
  submitButton: {
    backgroundColor: semantic.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.primary,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: semantic.primaryContrast, fontSize: 16, fontWeight: '600' },
});
