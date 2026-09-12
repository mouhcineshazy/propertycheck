/**
 * Property Detail Screen - React 19 Pattern
 *
 * - View property details with inspections list
 * - Start new inspection
 * - Delete property, comparison + moving-bundle upsell
 * - Trust Ink theme tokens (lib/theme.ts)
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Inspection } from '@propertycheck/database';
import { FREE_TIER_LIMITS } from '@propertycheck/shared';
import { getMobileSupabaseClient } from '../../lib/supabase';
import {
  fetchPropertyWithInspections,
  deleteProperty,
  checkFreeTierLimits,
  canGenerateComparison,
  checkBundleAccess,
  createBundleCheckout,
} from '../../lib';
import type { PropertyWithInspections } from '../../lib';
import { UpgradeModal } from '../../components';
import { useTranslation } from '../../contexts';
import { useTheme, useThemedStyles, spacing, radius, type AppTheme } from '../../lib/theme';

export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, locale } = useTranslation();
  const { semantic } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [property, setProperty] = useState<PropertyWithInspections | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [totalInspections, setTotalInspections] = useState(0);
  const [canAddInspection, setCanAddInspection] = useState(false);
  const [canCompare, setCanCompare] = useState(false);
  const [userProvince, setUserProvince] = useState<string | undefined>();
  const [isPremium, setIsPremium] = useState(false);
  const [hasBundle, setHasBundle] = useState(false);
  const [isPurchasingBundle, setIsPurchasingBundle] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadProperty() {
        if (!id) return;
        try {
          const supabase = getMobileSupabaseClient();
          const [data, limitsResult, comparisonResult, userResult, subResult, bundleResult] =
            await Promise.all([
              fetchPropertyWithInspections(id),
              checkFreeTierLimits(),
              canGenerateComparison(id),
              supabase.from('users').select('province').single(),
              supabase.from('subscriptions').select('status').single(),
              checkBundleAccess(id),
            ]);

          setProperty(data);
          setCanCompare(comparisonResult.canCompare);
          setUserProvince(userResult.data?.province || undefined);
          setHasBundle(bundleResult.hasBundle);

          const userIsPremium = subResult.data?.status === 'premium';
          setIsPremium(userIsPremium);

          if (limitsResult.data) {
            setTotalInspections(limitsResult.data.inspectionCount);
            setCanAddInspection(userIsPremium || limitsResult.data.canAddInspection);
          } else {
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

  const handlePurchaseBundle = async () => {
    if (!id) return;
    setIsPurchasingBundle(true);
    try {
      const { url, error } = await createBundleCheckout(id);
      if (error || !url) {
        Alert.alert(t('common.error'), t('property.detail.bundlePurchaseFailed'));
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('property.detail.bundlePurchaseFailed'));
    } finally {
      setIsPurchasingBundle(false);
    }
  };

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
    if (!canAddInspection) {
      setShowUpgradeModal(true);
      return;
    }
    router.push(`/inspection/new?propertyId=${id}` as Href);
  };

  const handleViewComparison = () => {
    router.push(`/inspection/compare?propertyId=${id}` as Href);
  };

  const renderInspection = ({ item }: { item: Inspection }) => {
    const completed = item.status === 'completed';
    return (
      <TouchableOpacity
        style={styles.inspectionCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/inspection/${item.id}` as Href)}
      >
        <View style={styles.inspectionAvatar}>
          <Ionicons name="clipboard-outline" size={18} color={semantic.fgMuted} />
        </View>
        <View style={styles.inspectionInfo}>
          <Text style={styles.inspectionDate}>{format(new Date(item.created_at), 'MMM d, yyyy')}</Text>
          <View style={styles.inspectionMeta}>
            <View style={[styles.statusBadge, completed ? styles.statusBadgeCompleted : styles.statusBadgeProgress]}>
              <Text style={[styles.statusBadgeText, completed ? styles.statusTextCompleted : styles.statusTextProgress]}>
                {completed ? t('inspection.status.completed') : t('inspection.status.inProgress')}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={semantic.fgSubtle} />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={semantic.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={40} color={semantic.danger} />
        </View>
        <Text style={styles.errorText}>{t('errors.notFound')}</Text>
      </View>
    );
  }

  const inspectionCount = property.inspections?.length || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={semantic.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('property.detail.title')}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.iconButton} hitSlop={8}>
          {isDeleting ? (
            <ActivityIndicator size="small" color={semantic.danger} />
          ) : (
            <Ionicons name="trash-outline" size={22} color={semantic.danger} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        {/* Property info */}
        <View style={styles.card}>
          <View style={styles.addressRow}>
            <View style={styles.addressAvatar}>
              <Ionicons name="location" size={20} color={semantic.primary} />
            </View>
            <Text style={styles.address}>{property.address}</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t(`property.new.types.${property.property_type}`)}</Text>
            </View>
            <Text style={styles.createdAt}>
              {t('property.detail.added')}{' '}
              {format(
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

        {/* Inspections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('property.detail.inspections')}</Text>
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
              <View style={styles.emptyIcon}>
                <Ionicons name="clipboard-outline" size={32} color={semantic.primary} />
              </View>
              <Text style={styles.emptyText2}>{t('property.detail.noInspections')}</Text>
              <Text style={styles.emptySubtext}>{t('property.detail.noInspectionsHint')}</Text>
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

        {/* Moving bundle upsell */}
        {canCompare && !isPremium && (
          <View style={hasBundle ? styles.bundleActiveCard : styles.bundleUpsellCard}>
            {hasBundle ? (
              <>
                <View style={styles.bundleIconRow}>
                  <Ionicons name="shield-checkmark" size={20} color={semantic.verified} />
                  <Text style={styles.bundleTitleGreen}>{t('property.detail.bundleActive')}</Text>
                </View>
                <Text style={styles.bundleDesc}>{t('property.detail.bundleActiveDesc')}</Text>
              </>
            ) : (
              <>
                <View style={styles.bundleIconRow}>
                  <Ionicons name="briefcase-outline" size={20} color={semantic.primary} />
                  <Text style={styles.bundleTitle}>{t('property.detail.bundleTitle')}</Text>
                </View>
                <Text style={styles.bundleDesc}>{t('property.detail.bundleDesc')}</Text>
                <TouchableOpacity
                  style={[styles.bundleButton, isPurchasingBundle && styles.buttonDisabled]}
                  onPress={handlePurchaseBundle}
                  disabled={isPurchasingBundle}
                  activeOpacity={0.85}
                >
                  {isPurchasingBundle ? (
                    <ActivityIndicator color={semantic.primaryContrast} size="small" />
                  ) : (
                    <Text style={styles.bundleButtonText}>{t('property.detail.bundleButton')}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {canCompare && (
          <TouchableOpacity style={styles.compareButton} onPress={handleViewComparison} activeOpacity={0.8}>
            <Ionicons name="git-compare-outline" size={20} color={semantic.primary} />
            <Text style={styles.compareButtonText}>{t('property.detail.compareInspections')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.startButton, !canAddInspection && styles.startButtonWarning]}
          onPress={handleStartInspection}
          activeOpacity={0.85}
        >
          <Ionicons name={canAddInspection ? 'camera-outline' : 'star'} size={20} color={semantic.primaryContrast} />
          <Text style={styles.startButtonText}>
            {canAddInspection ? t('property.detail.startInspection') : t('upgrade.title')}
          </Text>
        </TouchableOpacity>
      </View>

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="inspections_limit"
        userProvince={userProvince}
      />
    </View>
  );
}

const makeStyles = ({ semantic, shadows }: AppTheme) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: semantic.canvas },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: semantic.canvas,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: semantic.card,
    borderBottomWidth: 1,
    borderBottomColor: semantic.line,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: semantic.fg,
    textAlign: 'center',
  },
  content: { flex: 1 },
  contentInner: { padding: spacing.md, paddingBottom: 140 },
  card: {
    backgroundColor: semantic.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: semantic.line,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  addressAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: semantic.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  address: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: semantic.fg,
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: semantic.line,
  },
  badge: {
    backgroundColor: semantic.cardMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: semantic.fgMuted,
    textTransform: 'capitalize',
  },
  createdAt: { fontSize: 13, color: semantic.fgSubtle },
  notesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: semantic.line,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: semantic.fgSubtle,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: { fontSize: 14, color: semantic.fg, lineHeight: 20 },
  section: { marginBottom: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: semantic.fg },
  inspectionCount: { fontSize: 13, color: semantic.fgMuted },
  inspectionCountWarning: { color: semantic.warning, fontWeight: '600' },
  inspectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: semantic.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: semantic.line,
    padding: 14,
    marginBottom: spacing.sm,
  },
  inspectionAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: semantic.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectionInfo: { flex: 1 },
  inspectionDate: { fontSize: 15, fontWeight: '600', color: semantic.fg, marginBottom: 5 },
  inspectionMeta: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusBadgeCompleted: { backgroundColor: semantic.verifiedSoft },
  statusBadgeProgress: { backgroundColor: semantic.warningSoft },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  statusTextCompleted: { color: semantic.verified },
  statusTextProgress: { color: semantic.warning },
  emptyInspections: {
    backgroundColor: semantic.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: semantic.line,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: semantic.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyText2: { fontSize: 16, fontWeight: '600', color: semantic.fg },
  emptySubtext: {
    fontSize: 14,
    color: semantic.fgMuted,
    textAlign: 'center',
    marginTop: 4,
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
  errorText: { fontSize: 15, color: semantic.fgMuted, marginTop: 4 },
  bundleUpsellCard: {
    backgroundColor: semantic.primarySoft,
    borderWidth: 1,
    borderColor: semantic.line,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bundleActiveCard: {
    backgroundColor: semantic.verifiedSoft,
    borderWidth: 1,
    borderColor: semantic.line,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bundleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  bundleTitle: { fontSize: 15, fontWeight: '700', color: semantic.primary },
  bundleTitleGreen: { fontSize: 15, fontWeight: '700', color: semantic.verified },
  bundleDesc: {
    fontSize: 13,
    color: semantic.fgMuted,
    marginBottom: spacing.sm + 4,
    lineHeight: 18,
  },
  bundleButton: {
    backgroundColor: semantic.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bundleButtonText: { color: semantic.primaryContrast, fontSize: 15, fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: semantic.card,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: semantic.line,
    flexDirection: 'row',
    gap: spacing.sm + 4,
    ...shadows.md,
  },
  startButton: {
    flex: 1,
    backgroundColor: semantic.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  startButtonText: { color: semantic.primaryContrast, fontSize: 16, fontWeight: '600' },
  startButtonWarning: { backgroundColor: semantic.warning },
  compareButton: {
    backgroundColor: semantic.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  compareButtonText: { color: semantic.primary, fontSize: 15, fontWeight: '600' },
});
