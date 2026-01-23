/**
 * Settings Screen - React 19 Pattern
 *
 * Key React 19 changes:
 * - useAuth hook (useSyncExternalStore) instead of manual auth state
 * - Simpler data fetching with cleaner async patterns
 * - No unnecessary memoization
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSupabaseBrowserClient, User, Subscription } from '@propertycheck/database';
import { APP_CONFIG, PRICING, FREE_TIER_LIMITS, getProvince } from '@propertycheck/shared';
import { useAuth } from '../../hooks';
import { UpgradeModal } from '../../components';

export default function SettingsScreen() {
  // Use auth hook for signOut (React 19 pattern)
  const { user: authUser, signOut } = useAuth();

  // User profile and subscription state
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUserData() {
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();

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
      }
    }

    fetchUserData();
  }, [authUser]);

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  // Handle upgrade prompt - show modal
  const handleUpgrade = () => {
    setShowUpgradeModal(true);
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
      const message = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', message);
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
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
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
                {user?.full_name || 'No name set'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          {/* Province */}
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Province</Text>
            <Text style={styles.infoValue}>
              {userProvince?.name || 'Not set'}
            </Text>
          </View>
        </View>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.card}>
          <View style={styles.subscriptionRow}>
            <View>
              <Text style={styles.planName}>
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </Text>
              <Text style={styles.planDescription}>
                {isPremium
                  ? 'Unlimited properties and inspections'
                  : `Up to ${FREE_TIER_LIMITS.maxProperties} property, ${FREE_TIER_LIMITS.maxInspectionsTotal} inspection`}
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
                {isPremium ? 'Active' : 'Free'}
              </Text>
            </View>
          </View>

          {!isPremium ? (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Ionicons name="star" size={18} color="#fff" />
              <Text style={styles.upgradeButtonText}>
                Upgrade to Premium
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
                  <Text style={styles.manageButtonText}>Manage Subscription</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Show renewal date for premium users */}
          {isPremium && subscription?.current_period_end && (
            <Text style={styles.renewalInfo}>
              {subscription.cancel_at_period_end
                ? `Expires: ${new Date(subscription.current_period_end).toLocaleDateString()}`
                : `Renews: ${new Date(subscription.current_period_end).toLocaleDateString()}`}
            </Text>
          )}
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.version}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Support</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.supportEmail}</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
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
});
