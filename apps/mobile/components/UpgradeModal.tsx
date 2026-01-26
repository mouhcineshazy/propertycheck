/**
 * Upgrade Modal Component
 *
 * Shows upgrade prompt to free users when they hit limits or
 * try to access premium features. Includes monthly/annual pricing toggle
 * and province-specific messaging.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSupabaseBrowserClient } from '@propertycheck/database';
import {
  PRICING,
  FREE_TIER_LIMITS,
  getProvince,
  type ProvinceConfig,
} from '@propertycheck/shared';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  reason?: 'properties_limit' | 'inspections_limit' | 'pdf_storage' | 'share_link' | 'comparison_report' | 'general';
  userProvince?: string; // Province code (ON, BC, AB, QC)
}

// Dynamic upgrade reasons based on context
function getUpgradeReasons(province?: ProvinceConfig) {
  const provinceMessage = province?.upgradeMessage || 'Unlock premium features';

  return {
    properties_limit: {
      title: 'Ready for More Properties?',
      description: `You've completed your free move-in & move-out cycle. Upgrade to manage multiple properties.`,
      subtext: province ? `${provinceMessage}` : undefined,
      icon: 'home-outline' as const,
    },
    inspections_limit: {
      title: 'Move-In & Move-Out Complete!',
      description: `Great job documenting your rental! You've used both free inspections. Upgrade to track multiple properties.`,
      subtext: province ? `${provinceMessage}` : undefined,
      icon: 'clipboard-outline' as const,
    },
    pdf_storage: {
      title: 'Keep Your Evidence Safe',
      description: `Free PDFs expire after ${FREE_TIER_LIMITS.pdfRetentionDays} days. Upgrade for permanent storage you can access anytime.`,
      subtext: province ? `${province.disputeBody} disputes can take months - don't lose your evidence.` : undefined,
      icon: 'document-text-outline' as const,
    },
    share_link: {
      title: 'Share Secure Links',
      description: 'Send timestamped inspection reports your landlord can trust and verify.',
      subtext: province ? `Create legally defensible evidence per ${province.tenancyActShort}` : 'Premium: Send secure links landlords trust',
      icon: 'link-outline' as const,
    },
    comparison_report: {
      title: 'Save Your Comparison Report',
      description: 'Your move-in vs move-out comparison is ready! Upgrade to save it permanently without watermarks.',
      subtext: province ? `Perfect evidence for ${province.disputeBody} if needed` : undefined,
      icon: 'git-compare-outline' as const,
    },
    general: {
      title: 'Upgrade to Premium',
      description: 'Unlock unlimited properties, inspections, and shareable secure links.',
      subtext: province ? `${provinceMessage}` : undefined,
      icon: 'star-outline' as const,
    },
  };
}

// Lead with shareable links as top feature
const PREMIUM_FEATURES = [
  { icon: 'link', text: 'Shareable secure links landlords trust' },
  { icon: 'home', text: 'Unlimited properties' },
  { icon: 'clipboard', text: 'Unlimited inspections' },
  { icon: 'git-compare', text: 'Comparison reports without watermarks' },
  { icon: 'cloud', text: 'Permanent PDF storage' },
  { icon: 'shield-checkmark', text: 'Priority support' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function UpgradeModal({ visible, onClose, reason = 'general', userProvince }: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [province, setProvince] = useState<ProvinceConfig | undefined>();

  useEffect(() => {
    if (userProvince) {
      setProvince(getProvince(userProvince));
    }
  }, [userProvince]);

  const upgradeReasons = getUpgradeReasons(province);
  const reasonData = upgradeReasons[reason];

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Get the current session token for API authentication
      const supabase = getSupabaseBrowserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error('Please log in to upgrade your account.');
      }

      const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:3001';
    
      const response = await fetch(`${appUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ billingCycle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        const supported = await Linking.canOpenURL(data.url);
        if (supported) {
          await Linking.openURL(data.url);
          onClose();
        } else {
          throw new Error('Cannot open checkout URL');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const isAnnual = billingCycle === 'annual';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={reasonData.icon} size={28} color="#2563eb" />
              </View>
              <Text style={styles.title}>{reasonData.title}</Text>
              <Text style={styles.description}>{reasonData.description}</Text>
              {reasonData.subtext && (
                <Text style={styles.subtext}>{reasonData.subtext}</Text>
              )}
            </View>

            {/* Billing Toggle - Segmented Control Style */}
            <View style={styles.toggleWrapper}>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    !isAnnual && styles.toggleOptionActive,
                  ]}
                  onPress={() => setBillingCycle('monthly')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.toggleText,
                    !isAnnual && styles.toggleTextActive,
                  ]}>
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    isAnnual && styles.toggleOptionActive,
                  ]}
                  onPress={() => setBillingCycle('annual')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.toggleText,
                    isAnnual && styles.toggleTextActive,
                  ]}>
                    Annual
                  </Text>
                </TouchableOpacity>
              </View>
              {isAnnual && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{PRICING.annual.savings}</Text>
                </View>
              )}
            </View>

            {/* Pricing Card */}
            <View style={styles.pricingCard}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {isAnnual ? PRICING.annual.displayPrice : PRICING.monthly.displayPrice}
                </Text>
                <Text style={styles.priceInterval}>/month</Text>
              </View>
              {isAnnual && (
                <Text style={styles.annualNote}>
                  Billed annually ({PRICING.annual.annualTotal})
                </Text>
              )}

              {/* Features list - lead with shareable links */}
              <View style={styles.featuresContainer}>
                {PREMIUM_FEATURES.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons
                      name={index === 0 ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={20}
                      color={index === 0 ? '#2563eb' : '#22c55e'}
                    />
                    <Text style={[styles.featureText, index === 0 && styles.featureTextHighlight]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.upgradeButton, isLoading && styles.upgradeButtonDisabled]}
              onPress={handleUpgrade}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="#fff" />
                  <Text style={styles.upgradeButtonText}>Start 7-Day Free Trial</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={onClose}>
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>

            {/* Trial info */}
            <Text style={styles.trialInfo}>
              7-day free trial, then {isAnnual ? PRICING.annual.annualTotal : `${PRICING.monthly.displayPrice}/month`}. Cancel anytime.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  subtext: {
    fontSize: 13,
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  toggleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
    width: SCREEN_WIDTH - 96,
    maxWidth: 280,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  savingsBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  savingsText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  pricingCard: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  priceInterval: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  annualNote: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  featureTextHighlight: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  upgradeButtonDisabled: {
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 12,
    marginTop: 4,
  },
  laterButtonText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  },
  trialInfo: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default UpgradeModal;
