/**
 * Property Detail Screen - React 19 Pattern
 *
 * Features:
 * - View property details with inspections list
 * - Start new inspection
 * - Edit/Delete property
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams, Href, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Inspection } from '@propertycheck/database';
import { FREE_TIER_LIMITS } from '@propertycheck/shared';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { fetchPropertyWithInspections, deleteProperty, checkFreeTierLimits, canGenerateComparison } from '../../lib';
import type { PropertyWithInspections } from '../../lib';
import { UpgradeModal } from '../../components';
import { useTranslation } from '../../contexts';

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [property, setProperty] = useState<PropertyWithInspections | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [totalInspections, setTotalInspections] = useState(0);
  // Default to false (blocked) until we confirm user can add - prevents bypass on API errors
  const [canAddInspection, setCanAddInspection] = useState(false);
  const [canCompare, setCanCompare] = useState(false);
  const [userProvince, setUserProvince] = useState<string | undefined>();
  const [isPremium, setIsPremium] = useState(false);

  // Refetch data when screen gains focus (after creating/editing/deleting inspections)
  useFocusEffect(
    useCallback(() => {
      async function loadProperty() {
        if (!id) return;

        try {
          const supabase = getMobileSupabaseClient();

          // Load property, limits, comparison status, user province, and subscription in parallel
          const [data, limitsResult, comparisonResult, userResult, subResult] = await Promise.all([
            fetchPropertyWithInspections(id),
            checkFreeTierLimits(),
            canGenerateComparison(id),
            supabase.from('users').select('province').single(),
            supabase.from('subscriptions').select('status').single(),
          ]);

          setProperty(data);
          setCanCompare(comparisonResult.canCompare);
          setUserProvince(userResult.data?.province || undefined);

          // Check if user is premium
          const userIsPremium = subResult.data?.status === 'premium';
          setIsPremium(userIsPremium);

          // Update inspection limits - default to blocked if API fails
          if (limitsResult.data) {
            setTotalInspections(limitsResult.data.inspectionCount);
            // Premium users can always add inspections
            setCanAddInspection(userIsPremium || limitsResult.data.canAddInspection);
          } else {
            // API error - premium users still get access, free users blocked
            console.warn('Failed to check limits:', limitsResult.error);
            setCanAddInspection(userIsPremium);
          }
        } catch (err) {
          console.error('Error loading property:', err);
          Alert.alert(t('alerts.error'), t('property.detail.loadError'), [
            { text: t('common.ok'), onPress: () => router.back() },
          ]);
        } finally {
          setIsLoading(false);
        }
      }

      loadProperty();
    }, [id, router, t])
  );

  const handleDelete = () => {
    Alert.alert(
      t('property.detail.deleteConfirm.title'),
      t('property.detail.deleteConfirm.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('property.detail.deleteConfirm.confirmButton'),
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            setIsDeleting(true);
            try {
              await deleteProperty(id);
              Alert.alert(t('common.success'), t('property.detail.deleteConfirm.title'), [
                { text: t('common.ok'), onPress: () => router.back() },
              ]);
            } catch (err) {
              console.error('Error deleting property:', err);
              Alert.alert(t('common.error'), t('errors.generic'));
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleStartInspection = () => {
    if (!property) return;

    // Check free tier limits (total inspections across ALL properties)
    if (!canAddInspection) {
      setShowUpgradeModal(true);
      return;
    }

    router.push(`/inspection/new?propertyId=${id}` as Href);
  };

  const handleViewComparison = () => {
    router.push(`/inspection/compare?propertyId=${id}` as Href);
  };

  const renderInspection = ({ item }: { item: Inspection }) => (
    <TouchableOpacity
      style={styles.inspectionCard}
      onPress={() => router.push(`/inspection/${item.id}` as Href)}
    >
      <View style={styles.inspectionInfo}>
        <Text style={styles.inspectionDate}>
          {format(new Date(item.created_at), 'MMM d, yyyy')}
        </Text>
        <View style={styles.inspectionMeta}>
          <View
            style={[
              styles.statusBadge,
              item.status === 'completed' && styles.statusBadgeCompleted,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                item.status === 'completed' && styles.statusBadgeTextCompleted,
              ]}
            >
              {item.status === 'completed' ? t('inspection.status.completed') : t('inspection.status.inProgress')}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{t('errors.notFound')}</Text>
      </View>
    );
  }

  const inspectionCount = property.inspections?.length || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('property.detail.title')}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          {isDeleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Property Info Card */}
        <View style={styles.card}>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={24} color="#2563eb" />
            <Text style={styles.address}>{property.address}</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t(`property.new.types.${property.property_type}`)}</Text>
            </View>
            <Text style={styles.createdAt}>
              {t('property.detail.added')} {format(
                new Date(property.created_at),
                locale === 'fr' ? 'd MMM yyyy' : 'MMM d, yyyy',
                locale === 'fr' ? { locale: fr } : undefined
              )}
            </Text>
          </View>
          {property.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>{t('property.detail.notes')}</Text>
              <Text style={styles.notesText}>{property.notes}</Text>
            </View>
          )}
        </View>

        {/* Inspections Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('property.detail.inspections')}</Text>
            {/* Only show limit count for free users */}
            {isPremium ? (
              <Text style={styles.inspectionCount}>
                {totalInspections} {t('property.detail.total')}
              </Text>
            ) : (
              <Text style={[styles.inspectionCount, !canAddInspection && styles.inspectionCountWarning]}>
                {totalInspections} / {FREE_TIER_LIMITS.maxInspectionsTotal} {t('property.detail.total')}
                {!canAddInspection && ` (${t('property.detail.limitReached')})`}
              </Text>
            )}
          </View>

          {inspectionCount === 0 ? (
            <View style={styles.emptyInspections}>
              <Ionicons name="clipboard-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>{t('property.detail.noInspections')}</Text>
              <Text style={styles.emptySubtext}>
                {t('property.detail.noInspectionsHint')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={property.inspections}
              renderItem={renderInspection}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {canCompare && (
          <TouchableOpacity
            style={styles.compareButton}
            onPress={handleViewComparison}
          >
            <Ionicons name="git-compare-outline" size={22} color="#2563eb" />
            <Text style={styles.compareButtonText}>{t('property.detail.compareInspections')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.startButton,
            !canAddInspection && styles.startButtonWarning,
          ]}
          onPress={handleStartInspection}
        >
          <Ionicons
            name={canAddInspection ? 'camera-outline' : 'star'}
            size={22}
            color="#fff"
          />
          <Text style={styles.startButtonText}>
            {canAddInspection ? t('property.detail.startInspection') : t('upgrade.title')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="inspections_limit"
        userProvince={userProvince}
      />
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  address: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  badge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3730a3',
    textTransform: 'capitalize',
  },
  createdAt: {
    fontSize: 13,
    color: '#666',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  section: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  inspectionCount: {
    fontSize: 13,
    color: '#666',
  },
  inspectionCountWarning: {
    color: '#f59e0b',
    fontWeight: '500',
  },
  inspectionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspectionInfo: {
    flex: 1,
  },
  inspectionDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  inspectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#92400e',
  },
  statusBadgeTextCompleted: {
    color: '#166534',
  },
  emptyInspections: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButtonWarning: {
    backgroundColor: '#f59e0b',
  },
  compareButton: {
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    gap: 8,
    marginRight: 12,
  },
  compareButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});
