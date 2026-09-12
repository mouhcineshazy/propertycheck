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
import { useTheme, useThemedStyles, type AppTheme } from '../lib/theme';

const provinces = getProvinceOptions();

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const th = useTheme();
  const styles = useThemedStyles(makeStyles);
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
            <Ionicons name="location-outline" size={32} color={th.semantic.primary} />
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
                <Ionicons name="checkmark-circle" size={20} color={th.semantic.primary} />
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
              <Ionicons name="shield-checkmark-outline" size={14} color={th.semantic.verified} />
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
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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

const makeStyles = (th: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: th.semantic.card,
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
    backgroundColor: th.semantic.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: th.semantic.fg,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: th.semantic.fgMuted,
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
    backgroundColor: th.semantic.cardMuted,
    borderWidth: 2,
    borderColor: th.semantic.line,
    borderRadius: 12,
    padding: 16,
  },
  provinceCardSelected: {
    backgroundColor: th.semantic.primarySoft,
    borderColor: th.semantic.primary,
  },
  provinceText: {
    fontSize: 16,
    fontWeight: '500',
    color: th.semantic.fg,
  },
  provinceTextSelected: {
    color: th.semantic.fg,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: th.semantic.verifiedSoft,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: th.semantic.verified,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: th.semantic.verified,
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
    color: th.semantic.verified,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: th.semantic.primary,
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
    color: th.semantic.fgSubtle,
    fontSize: 15,
    fontWeight: '500',
  },
});
