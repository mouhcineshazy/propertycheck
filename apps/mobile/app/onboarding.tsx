/**
 * Onboarding Screen - Province Selection
 *
 * First screen new users see after registration.
 * Collects province for province-specific messaging throughout the app.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMobileSupabaseClient } from '../lib/supabase';
import { getProvinceOptions, getProvince, APP_CONFIG } from '@propertycheck/shared';
import { useAuth } from '../hooks';

const provinces = getProvinceOptions();

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedProvince || !user) return;

    setIsLoading(true);
    try {
      const supabase = getMobileSupabaseClient();

      // Update user profile with province
      const { error } = await supabase
        .from('users')
        .update({
          province: selectedProvince,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Error saving province:', err);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const supabase = getMobileSupabaseClient();

      // Mark onboarding as complete without province
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Error skipping onboarding:', err);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProvinceData = selectedProvince ? getProvince(selectedProvince) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={32} color="#2563eb" />
          </View>
          <Text style={styles.title}>Where are you renting?</Text>
          <Text style={styles.subtitle}>
            We&apos;ll customize {APP_CONFIG.name} with province-specific legal information and messaging.
          </Text>
        </View>

        {/* Province selector */}
        <View style={styles.provinceGrid}>
          {provinces.map((province) => (
            <TouchableOpacity
              key={province.value}
              style={[
                styles.provinceCard,
                selectedProvince === province.value && styles.provinceCardSelected,
              ]}
              onPress={() => setSelectedProvince(province.value)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.provinceText,
                  selectedProvince === province.value && styles.provinceTextSelected,
                ]}
              >
                {province.label}
              </Text>
              {selectedProvince === province.value && (
                <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Province info preview */}
        {selectedProvinceData && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              {selectedProvinceData.name} Renters
            </Text>
            <Text style={styles.infoText}>
              {selectedProvinceData.inspectionRequirements}
            </Text>
            <View style={styles.infoBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#166534" />
              <Text style={styles.infoBadgeText}>
                Disputes resolved via {selectedProvinceData.disputeBody}
              </Text>
            </View>
          </View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedProvince || isLoading) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedProvince || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  provinceGrid: {
    gap: 12,
  },
  provinceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  provinceCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  provinceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  provinceTextSelected: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBadgeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  },
});
