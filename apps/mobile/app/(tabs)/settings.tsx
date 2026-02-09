/**
 * Settings Screen - React 19 Pattern
 *
 * Key React 19 changes:
 * - useAuth hook (useSyncExternalStore) instead of manual auth state
 * - Simpler data fetching with cleaner async patterns
 * - No unnecessary memoization
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Subscription } from '@propertycheck/database';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { APP_CONFIG, FREE_TIER_LIMITS, getProvince, getProvinceOptions } from '@propertycheck/shared';
import { useAuth } from '../../hooks';
import { UpgradeModal } from '../../components';
import { useI18n, type Locale } from '../../contexts';

// Get province options for dropdown
const PROVINCE_OPTIONS = getProvinceOptions();

export default function SettingsScreen() {
  // Use auth hook for signOut (React 19 pattern)
  const { user: authUser, signOut } = useAuth();
  // i18n hook for translations and language switching
  const { t, locale, setLocale, locales, localeNames } = useI18n();

  // User profile and subscription state
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [isSavingProvince, setIsSavingProvince] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Fetch user data function (reusable for refresh)
  const fetchUserData = useCallback(async (showRefreshIndicator = false) => {
    if (!authUser) {
      setIsLoading(false);
      return;
    }

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      const supabase = getMobileSupabaseClient();

      // Fetch user profile and subscription in parallel
      const [userResult, subResult] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', authUser.id).single(),
      ]);

      setUser(userResult.data);
      setSubscription(subResult.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [authUser]);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    fetchUserData(true);
  }, [fetchUserData]);

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(t('settings.signOut.confirmTitle'), t('settings.signOut.confirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut.button'),
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  // Handle language change
  const handleLanguageChange = async (newLocale: Locale) => {
    await setLocale(newLocale);
    setShowLanguagePicker(false);
  };

  // Handle upgrade prompt - show modal
  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  // Handle province change - save to database
  const handleProvinceChange = async (provinceCode: string) => {
    if (!authUser) return;

    setIsSavingProvince(true);
    setShowProvincePicker(false);

    try {
      const supabase = getMobileSupabaseClient();

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { province: provinceCode },
      });

      if (authError) throw authError;

      // Also update the users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ province: provinceCode })
        .eq('id', authUser.id);

      if (dbError) {
        console.error('DB update error:', dbError);
        throw dbError;
      }

      // Update local state
      setUser(prev => prev ? { ...prev, province: provinceCode } : null);

      Alert.alert(t('alerts.success'), t('settings.subscription.provinceUpdated'));
    } catch (error) {
      console.error('Province update error:', error);
      const message = error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : t('errors.generic');
      Alert.alert(t('alerts.error'), message);
    } finally {
      setIsSavingProvince(false);
    }
  };

  // Handle manage subscription - open Stripe portal
  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${appUrl}/api/stripe/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open subscription portal');
      }

      if (data.url) {
        const supported = await Linking.canOpenURL(data.url);
        if (supported) {
          await Linking.openURL(data.url);
        } else {
          throw new Error('Cannot open subscription portal');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('alerts.error'), message);
    } finally {
      setIsManagingSubscription(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const isPremium = subscription?.status === 'premium';
  const userProvince = user?.province ? getProvince(user.province) : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sections.account')}</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.full_name || t('common.noNameSet')}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          {/* Province - Editable */}
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.editableRow}
            onPress={() => setShowProvincePicker(true)}
            disabled={isSavingProvince}
          >
            <View>
              <Text style={styles.infoLabel}>{t('settings.account.province')}</Text>
              <Text style={styles.infoValue}>
                {userProvince?.name || t('common.notSet')}
              </Text>
            </View>
            {isSavingProvince ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#999" />
            )}
          </TouchableOpacity>
        </View>
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
              <Text style={styles.pickerTitle}>{t('settings.account.selectProvince')}</Text>
              <TouchableOpacity onPress={() => setShowProvincePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.pickerSubtitle}>
              {t('settings.account.provinceHint')}
            </Text>
            {PROVINCE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  user?.province === option.value && styles.pickerOptionSelected,
                ]}
                onPress={() => handleProvinceChange(option.value)}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    user?.province === option.value && styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {user?.province === option.value && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sections.subscription')}</Text>
        <View style={styles.card}>
          <View style={styles.subscriptionRow}>
            <View>
              <Text style={styles.planName}>
                {isPremium ? t('settings.subscription.premiumPlan') : t('settings.subscription.freePlan')}
              </Text>
              <Text style={styles.planDescription}>
                {isPremium
                  ? t('settings.subscription.premiumDescription')
                  : t('settings.subscription.freeDescription', { maxProperties: FREE_TIER_LIMITS.maxProperties, maxInspections: FREE_TIER_LIMITS.maxInspectionsTotal })}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, isPremium && styles.statusBadgePremium]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isPremium && styles.statusBadgeTextPremium,
                ]}
              >
                {isPremium ? t('settings.subscription.statusActive') : t('settings.subscription.statusFree')}
              </Text>
            </View>
          </View>

          {!isPremium ? (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Ionicons name="star" size={18} color="#fff" />
              <Text style={styles.upgradeButtonText}>
                {t('settings.subscription.upgradeButton')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={handleManageSubscription}
              disabled={isManagingSubscription}
            >
              {isManagingSubscription ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <>
                  <Ionicons name="settings-outline" size={18} color="#2563eb" />
                  <Text style={styles.manageButtonText}>{t('settings.subscription.manageButton')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Show renewal date for premium users */}
          {isPremium && subscription?.current_period_end && (
            <Text style={styles.renewalInfo}>
              {subscription.cancel_at_period_end
                ? t('settings.subscription.expiresOn', { date: new Date(subscription.current_period_end).toLocaleDateString() })
                : t('settings.subscription.renewsOn', { date: new Date(subscription.current_period_end).toLocaleDateString() })}
            </Text>
          )}
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sections.about')}</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.about.version')}</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.version}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.about.support')}</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.supportEmail}</Text>
          </View>
        </View>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sections.legal')}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_APP_URL || 'https://propertycheck.app'}/${locale}/terms`)}
          >
            <View style={styles.legalRowContent}>
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <Text style={styles.legalRowText}>{t('settings.legal.termsOfService')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_APP_URL || 'https://propertycheck.app'}/${locale}/privacy`)}
          >
            <View style={styles.legalRowContent}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
              <Text style={styles.legalRowText}>{t('settings.legal.privacyPolicy')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_APP_URL || 'https://propertycheck.app'}/${locale}/cookies`)}
          >
            <View style={styles.legalRowContent}>
              <Ionicons name="finger-print-outline" size={20} color="#666" />
              <Text style={styles.legalRowText}>{t('settings.legal.cookiePolicy')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sections.language')}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.editableRow}
            onPress={() => setShowLanguagePicker(true)}
          >
            <View style={styles.legalRowContent}>
              <Ionicons name="language-outline" size={20} color="#666" />
              <View>
                <Text style={styles.legalRowText}>{t('settings.language.title')}</Text>
                <Text style={styles.infoLabel}>{localeNames[locale]}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguagePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{t('settings.language.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {locales.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.pickerOption,
                  locale === loc && styles.pickerOptionSelected,
                ]}
                onPress={() => handleLanguageChange(loc)}
              >
                <View style={styles.languageOption}>
                  <Text style={styles.languageFlag}>
                    {loc === 'en' ? '🇨🇦' : '🇫🇷'}
                  </Text>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      locale === loc && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {localeNames[loc]}
                  </Text>
                </View>
                {locale === loc && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>{t('settings.signOut.button')}</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="general"
        userProvince={user?.province || undefined}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  planDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePremium: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  statusBadgeTextPremium: {
    color: '#166534',
  },
  upgradeButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  manageButtonText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
  renewalInfo: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
  },
  bottomPadding: {
    height: 40,
  },
  editableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  pickerSubtitle: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  legalRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legalRowText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageFlag: {
    fontSize: 24,
  },
});
