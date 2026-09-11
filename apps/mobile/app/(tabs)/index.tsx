/**
 * Properties Screen (Home) - React 19 Pattern
 *
 * - useProperties hook (useSyncExternalStore) for data — no useEffect fetch
 * - useOptimistic for delete operations
 * - Trust Ink theme tokens (lib/theme.ts)
 */

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, Href, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '@propertycheck/database';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { FREE_TIER_LIMITS } from '@propertycheck/shared';
import { useProperties, useOptimistic, useAuth } from '../../hooks';
import { UpgradeModal } from '../../components';
import { useTranslation } from '../../contexts';
import { colors, semantic, spacing, radius, shadows } from '../../lib/theme';

export default function PropertiesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { properties, isLoading, error, refetch } = useProperties();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      const supabase = getMobileSupabaseClient();
      const { data } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();
      setIsPremium(data?.status === 'premium');
    };
    fetchSubscription();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [optimisticProperties, addOptimistic] = useOptimistic(
    properties,
    (currentProperties, deletedId: string) =>
      currentProperties.filter((p) => p.id !== deletedId)
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/property/${item.id}` as Href)}
    >
      <View style={styles.propertyAvatar}>
        <Ionicons name="home" size={20} color={semantic.primary} />
      </View>
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.propertyMeta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t(`property.new.types.${item.property_type}`)}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={semantic.fgSubtle} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="home-outline" size={40} color={semantic.primary} />
      </View>
      <Text style={styles.emptyTitle}>{t('properties.empty.title')}</Text>
      <Text style={styles.emptyText}>{t('properties.empty.subtitle')}</Text>
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.85}
        onPress={() => router.push('/property/new' as Href)}
      >
        <Ionicons name="add" size={20} color={semantic.primaryContrast} />
        <Text style={styles.addButtonText}>{t('properties.empty.addButton')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={semantic.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={40} color={semantic.danger} />
        </View>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>{t('errors.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAtLimit = !isPremium && optimisticProperties.length >= FREE_TIER_LIMITS.maxProperties;

  const handleAddProperty = () => {
    if (isAtLimit) {
      setShowUpgradeModal(true);
    } else {
      router.push('/property/new' as Href);
    }
  };

  return (
    <View style={styles.container}>
      {optimisticProperties.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {!isPremium && (
            <TouchableOpacity
              style={[styles.limitBanner, isAtLimit && styles.limitBannerWarning]}
              activeOpacity={isAtLimit ? 0.7 : 1}
              onPress={isAtLimit ? () => setShowUpgradeModal(true) : undefined}
            >
              <Ionicons
                name={isAtLimit ? 'star' : 'information-circle-outline'}
                size={15}
                color={isAtLimit ? colors.amber[700] : semantic.fgMuted}
              />
              <Text style={[styles.limitText, isAtLimit && styles.limitTextWarning]}>
                {t('properties.limitBanner.text', {
                  current: optimisticProperties.length,
                  max: FREE_TIER_LIMITS.maxProperties,
                })}
                {isAtLimit && t('properties.limitBanner.tapToUpgrade')}
              </Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={optimisticProperties}
            renderItem={renderProperty}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={semantic.primary}
              />
            }
          />
          <TouchableOpacity
            style={[styles.fab, isAtLimit && styles.fabWarning]}
            activeOpacity={0.85}
            onPress={handleAddProperty}
          >
            <Ionicons name={isAtLimit ? 'star' : 'add'} size={26} color={semantic.primaryContrast} />
          </TouchableOpacity>
        </>
      )}

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="properties_limit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semantic.canvas,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: semantic.canvas,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: semantic.cardMuted,
    borderBottomWidth: 1,
    borderBottomColor: semantic.line,
  },
  limitBannerWarning: {
    backgroundColor: colors.amber[50],
    borderBottomColor: colors.amber[100],
  },
  limitText: {
    fontSize: 13,
    color: semantic.fgMuted,
  },
  limitTextWarning: {
    color: colors.amber[700],
    fontWeight: '600',
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: semantic.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: semantic.line,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
    ...shadows.sm,
  },
  propertyAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: semantic.fg,
    marginBottom: 5,
  },
  propertyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: semantic.cardMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: semantic.fgMuted,
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: semantic.fg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: semantic.fgMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: semantic.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    ...shadows.primary,
  },
  addButtonText: {
    color: semantic.primaryContrast,
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: semantic.primary,
    width: 58,
    height: 58,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primary,
  },
  fabWarning: {
    backgroundColor: semantic.warning,
    shadowColor: semantic.warning,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.red[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 15,
    color: semantic.fgMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  retryText: {
    color: semantic.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
