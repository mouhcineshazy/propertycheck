/**
 * Properties Screen (Home) - React 19 Pattern
 *
 * - useProperties hook (useSyncExternalStore) for data — no useEffect fetch
 * - useOptimistic for delete operations
 * - Trust Ink theme tokens (lib/theme.ts)
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter, Href, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProperties, useOptimistic } from '../../hooks';
import type { PropertyWithSummaries } from '../../lib';
import { PropertyCard } from '../../components';
import { useTranslation } from '../../contexts';
import { useTheme, useThemedStyles, spacing, radius, type AppTheme } from '../../lib/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PropertiesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { semantic } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { properties, isLoading, error, refetch } = useProperties();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const handleToggleCard = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderProperty = ({ item }: { item: PropertyWithSummaries }) => (
    <PropertyCard
      property={item}
      expanded={expandedId === item.id}
      onToggle={() => handleToggleCard(item.id)}
      onOpen={() => router.push(`/property/${item.id}` as Href)}
      onNewInspection={() => router.push(`/inspection/new?propertyId=${item.id}` as Href)}
      onOpenInspection={(inspectionId) => router.push(`/inspection/${inspectionId}` as Href)}
    />
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

  return (
    <View style={styles.container}>
      {optimisticProperties.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
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
            style={styles.fab}
            activeOpacity={0.85}
            onPress={() => router.push('/property/new' as Href)}
          >
            <Ionicons name="add" size={26} color={semantic.primaryContrast} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const makeStyles = ({ semantic, shadows }: AppTheme) =>
  StyleSheet.create({
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
    backgroundColor: semantic.primarySoft,
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
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: semantic.dangerSoft,
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
