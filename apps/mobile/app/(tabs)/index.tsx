/**
 * Properties Screen (Home) - React 19 Pattern
 *
 * Key React 19 changes:
 * - useSyncExternalStore via useProperties hook (no useEffect for data fetching)
 * - useOptimistic for delete operations (instant UI updates)
 * - No useCallback needed for render functions (compiler handles it)
 * - Cleaner component - no manual loading/error state management
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
} from 'react-native';
import { useRouter, Href, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '@propertycheck/database';
import { FREE_TIER_LIMITS } from '@propertycheck/shared';
import { useProperties, useOptimistic } from '../../hooks';

export default function PropertiesScreen() {
  const router = useRouter();
  // Fetch properties using React 19 pattern (useSyncExternalStore internally)
  // No useEffect needed - data is fetched on mount via the hook
  const { properties, isLoading, error, refetch } = useProperties();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refetch properties when screen gains focus (e.g., after adding a new property)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Optimistic updates - UI updates instantly, rollback on server error
  const [optimisticProperties, addOptimistic] = useOptimistic(
    properties,
    (currentProperties, deletedId: string) =>
      currentProperties.filter((p) => p.id !== deletedId)
  );

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Render individual property card
  // Note: No useCallback wrapper needed - React 19 compiler handles memoization
  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => router.push(`/property/${item.id}` as Href)}
    >
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyAddress}>{item.address}</Text>
        <View style={styles.propertyMeta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.property_type}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="home-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Properties Yet</Text>
      <Text style={styles.emptyText}>
        Add your first property to start tracking inspections.
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/property/new' as Href)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Property</Text>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Try Again</Text>
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
          <View style={styles.limitBanner}>
            <Text style={styles.limitText}>
              {optimisticProperties.length} / {FREE_TIER_LIMITS.maxProperties}{' '}
              properties (Free tier)
            </Text>
          </View>
          <FlatList
            data={optimisticProperties}
            renderItem={renderProperty}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#2563eb"
              />
            }
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/property/new' as Href)}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
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
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  limitBanner: {
    backgroundColor: '#fef3c7',
    padding: 8,
    alignItems: 'center',
  },
  limitText: {
    fontSize: 12,
    color: '#92400e',
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  propertyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#3730a3',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
});
