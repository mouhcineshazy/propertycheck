/**
 * New Property Screen - React 19 Pattern
 *
 * Features:
 * - Create new property with form validation
 * - useActionState for form handling
 * - Property type selection
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
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { formatZodError } from '@propertycheck/shared';
import { useActionState } from '../../hooks';
import { createProperty } from '../../lib';

// Property types (must match database PropertyType)
const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
] as const;

// Validation schema
const newPropertySchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters'),
  property_type: z.enum(['apartment', 'house', 'condo']),
  notes: z.string().optional(),
});

// Type for action state
type NewPropertyState = {
  errors: Record<string, string>;
};

const initialState: NewPropertyState = {
  errors: {},
};

// Create property action
async function createPropertyAction(
  _prevState: NewPropertyState,
  payload: {
    address: string;
    property_type: string;
    notes: string;
    onSuccess: () => void;
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
    const message = err instanceof Error ? err.message : 'Failed to create property';
    Alert.alert('Error', message);
    return { errors: {} };
  }
}

export default function NewPropertyScreen() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<string>('apartment');
  const [notes, setNotes] = useState('');

  const [state, dispatch, isPending] = useActionState(createPropertyAction, initialState);

  const handleSubmit = () => {
    dispatch({
      address,
      property_type: propertyType,
      notes,
      onSuccess: () => {
        Alert.alert('Success', 'Property created successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Property</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Property Address *</Text>
          <TextInput
            style={[styles.input, state.errors.address && styles.inputError]}
            placeholder="123 Main St, City, State"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
            editable={!isPending}
          />
          {state.errors.address && (
            <Text style={styles.errorText}>{state.errors.address}</Text>
          )}
        </View>

        {/* Property Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Property Type *</Text>
          <View style={styles.typeGrid}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  propertyType === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setPropertyType(type.value)}
                disabled={isPending}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    propertyType === type.value && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {state.errors.property_type && (
            <Text style={styles.errorText}>{state.errors.property_type}</Text>
          )}
        </View>

        {/* Notes Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes about this property..."
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isPending}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Create Property</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  typeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
