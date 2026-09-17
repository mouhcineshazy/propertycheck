/**
 * PropertyCard — collapsible property row for the Properties list.
 *
 * Collapsed: address, type, status, and a peek strip of the most recent
 * inspection's room photos. Expanded: each inspection shown with its derived
 * move-in / move-out role, completion date, and one photo per documented room.
 * Photos are the primary content — the point of the redesign.
 */
import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FREE_TIER_LIMITS } from '@propertycheck/shared';
import type { PropertyWithSummaries, InspectionSummary, RoomSummaryPhoto } from '../lib/types';
import { getPhotoUrl } from '../lib/storage';
import { useTranslation } from '../contexts';
import { useTheme, useThemedStyles, spacing, radius, type AppTheme } from '../lib/theme';

const ROOM_FALLBACK: Record<string, { en: string; fr: string }> = {
  living_room: { en: 'Living', fr: 'Salon' },
  kitchen: { en: 'Kitchen', fr: 'Cuisine' },
  bedroom: { en: 'Bedroom', fr: 'Chambre' },
  bathroom: { en: 'Bathroom', fr: 'Salle de bain' },
  other: { en: 'Other', fr: 'Autre' },
};

const PEEK_LIMIT = 4;

type Locale = 'en' | 'fr';

function roomLabel(photo: RoomSummaryPhoto, locale: Locale): string {
  if (photo.roomLabel) return photo.roomLabel;
  const fallback = ROOM_FALLBACK[photo.roomType ?? 'other'] ?? ROOM_FALLBACK.other;
  return fallback[locale];
}

function formatDate(iso: string, locale: Locale): string {
  return format(new Date(iso), 'MMM d, yyyy', locale === 'fr' ? { locale: fr } : undefined);
}

type Props = {
  property: PropertyWithSummaries;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onNewInspection: () => void;
  onOpenInspection: (inspectionId: string) => void;
};

function PropertyCardComponent({
  property,
  expanded,
  onToggle,
  onOpen,
  onNewInspection,
  onOpenInspection,
}: Props) {
  const { t, locale } = useTranslation();
  const loc: Locale = locale === 'fr' ? 'fr' : 'en';
  const { semantic } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const inspections = property.inspections;
  const latest = inspections[inspections.length - 1];
  const count = inspections.length;
  const { completedCount, isLocked } = property;
  const maxCompleted = FREE_TIER_LIMITS.maxCompletedInspectionsPerProperty;
  const atCompletionLimit = completedCount >= maxCompleted;
  const canAddInspection = !isLocked && !atCompletionLimit;
  const anyInProgress = inspections.some((i) => i.status !== 'completed');

  const subline = (() => {
    if (count === 0) return t('properties.card.noInspections');
    if (isLocked) return t('properties.card.finalized');
    if (anyInProgress) return t('properties.card.inProgress');
    return t('properties.card.completed', { date: formatDate(latest.inspection_date, loc) });
  })();

  return (
    <View style={[styles.card, expanded && styles.cardOpen]}>
      <Pressable
        onPress={onToggle}
        style={styles.head}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.avatar}>
          <Ionicons name="home" size={20} color={semantic.primary} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.addr} numberOfLines={1}>
            {property.address}
          </Text>
          <View style={styles.subline}>
            <Text style={styles.type}>{t(`property.new.types.${property.property_type}`)}</Text>
            <View style={styles.dot} />
            <Text style={styles.sublineText} numberOfLines={1}>
              {subline}
            </Text>
          </View>
        </View>
        {count > 0 && (
          <View style={[styles.pill, anyInProgress && !isLocked ? styles.pillProgress : styles.pillDone]}>
            <Ionicons
              name={isLocked ? 'lock-closed' : anyInProgress ? 'time-outline' : 'checkmark-circle'}
              size={12}
              color={anyInProgress && !isLocked ? semantic.warning : semantic.verified}
            />
            <Text
              style={[
                styles.pillText,
                anyInProgress && !isLocked ? styles.pillTextProgress : styles.pillTextDone,
              ]}
            >
              {isLocked
                ? t('properties.card.finalized')
                : anyInProgress
                  ? t('properties.card.inProgress')
                  : t('properties.card.completedOf', { count: completedCount, max: maxCompleted })}
            </Text>
          </View>
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={semantic.fgSubtle}
          style={styles.chev}
        />
      </Pressable>

      {!expanded && latest && latest.roomPhotos.length > 0 && (
        <PeekStrip photos={latest.roomPhotos} styles={styles} />
      )}

      {expanded && (
        <View style={styles.body}>
          {count === 0 ? (
            <Text style={styles.emptyHint}>{t('property.detail.noInspectionsHint')}</Text>
          ) : (
            inspections.map((inspection) => (
              <InspectionBlock
                key={inspection.id}
                inspection={inspection}
                loc={loc}
                t={t}
                styles={styles}
                onPress={() => onOpenInspection(inspection.id)}
              />
            ))
          )}

          <View style={styles.actions}>
            {canAddInspection ? (
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onNewInspection}>
                <Ionicons name="camera-outline" size={16} color={semantic.primaryContrast} />
                <Text style={styles.btnPrimaryText}>{t('properties.card.newInspection')}</Text>
              </Pressable>
            ) : (
              <View style={[styles.btn, styles.noteChip]}>
                <Ionicons
                  name={isLocked ? 'lock-closed' : 'checkmark-done'}
                  size={15}
                  color={semantic.fgMuted}
                />
                <Text style={styles.noteChipText}>
                  {isLocked
                    ? t('properties.card.finalizedNote')
                    : t('properties.card.limitReachedNote', { max: maxCompleted })}
                </Text>
              </View>
            )}
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onOpen}>
              <Text style={styles.btnGhostText}>{t('properties.card.open')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function PeekStrip({
  photos,
  styles,
}: {
  photos: RoomSummaryPhoto[];
  styles: ReturnType<typeof makeStyles>;
}) {
  const shown = photos.slice(0, PEEK_LIMIT);
  const remaining = photos.length - shown.length;
  return (
    <View style={styles.peek}>
      {shown.map((photo) => (
        <View key={photo.id} style={styles.peekItem}>
          <Image
            source={{ uri: getPhotoUrl(photo.storagePath) }}
            style={styles.peekImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        </View>
      ))}
      {remaining > 0 && (
        <View style={[styles.peekItem, styles.peekMore]}>
          <Text style={styles.peekMoreText}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
}

function InspectionBlock({
  inspection,
  loc,
  t,
  styles,
  onPress,
}: {
  inspection: InspectionSummary;
  loc: Locale;
  t: (key: string, options?: Record<string, unknown>) => string;
  styles: ReturnType<typeof makeStyles>;
  onPress: () => void;
}) {
  const { semantic } = useTheme();
  const completed = inspection.status === 'completed';
  const roleText = t(`properties.card.${inspection.role}`);
  const dateText = completed
    ? t('properties.card.completed', { date: formatDate(inspection.inspection_date, loc) })
    : t('properties.card.roomsDocumented', { count: inspection.roomPhotos.length });

  return (
    <Pressable style={styles.insp} onPress={onPress} accessibilityRole="button">
      <View style={styles.inspHead}>
        <View style={[styles.roleBadge, completed ? styles.pillDone : styles.pillProgress]}>
          <Ionicons
            name={completed ? 'checkmark-circle' : 'time-outline'}
            size={12}
            color={completed ? semantic.verified : semantic.warning}
          />
          <Text style={[styles.pillText, completed ? styles.pillTextDone : styles.pillTextProgress]}>
            {roleText}
          </Text>
        </View>
        <Text style={styles.inspDate}>{dateText}</Text>
      </View>

      {inspection.roomPhotos.length === 0 ? (
        <Text style={styles.noPhotos}>{t('properties.card.noPhotosYet')}</Text>
      ) : (
        <View style={styles.rooms}>
          {inspection.roomPhotos.map((photo) => (
            <View key={photo.id} style={styles.room}>
              <Image
                source={{ uri: getPhotoUrl(photo.storagePath) }}
                style={styles.roomImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
              <Text style={styles.roomLabel} numberOfLines={1}>
                {roomLabel(photo, loc)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

export const PropertyCard = memo(PropertyCardComponent);

const makeStyles = ({ semantic, shadows }: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: semantic.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: semantic.line,
      overflow: 'hidden',
      marginBottom: spacing.sm + 4,
      ...shadows.sm,
    },
    cardOpen: {
      borderColor: semantic.lineStrong,
      ...shadows.md,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 2,
      padding: spacing.md - 2,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: semantic.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    meta: { flex: 1, minWidth: 0 },
    addr: { fontSize: 16, fontWeight: '700', color: semantic.fg },
    subline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    type: { fontSize: 12, fontWeight: '600', color: semantic.fgMuted, textTransform: 'capitalize' },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: semantic.fgSubtle },
    sublineText: { flex: 1, fontSize: 12, color: semantic.fgMuted },
    chev: { marginLeft: 2 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    pillDone: { backgroundColor: semantic.verifiedSoft },
    pillProgress: { backgroundColor: semantic.warningSoft },
    pillText: { fontSize: 11, fontWeight: '700' },
    pillTextDone: { color: semantic.verified },
    pillTextProgress: { color: semantic.warning },
    peek: {
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: spacing.md - 2,
      paddingBottom: spacing.md - 2,
    },
    peekItem: { flex: 1, aspectRatio: 1, borderRadius: radius.sm + 2, overflow: 'hidden' },
    peekImage: { width: '100%', height: '100%', backgroundColor: semantic.cardMuted },
    peekMore: {
      backgroundColor: semantic.cardMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    peekMoreText: { fontSize: 13, fontWeight: '700', color: semantic.fgMuted },
    body: {
      borderTopWidth: 1,
      borderTopColor: semantic.line,
    },
    emptyHint: {
      fontSize: 13,
      color: semantic.fgMuted,
      padding: spacing.md,
      textAlign: 'center',
    },
    insp: {
      paddingHorizontal: spacing.md - 2,
      paddingTop: spacing.sm + 4,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: semantic.line,
    },
    inspHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: spacing.sm + 2,
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    inspDate: { fontSize: 11.5, color: semantic.fgSubtle },
    noPhotos: { fontSize: 12, color: semantic.fgSubtle, paddingVertical: spacing.sm },
    rooms: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    room: { width: '18.6%' },
    roomImage: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radius.sm + 2,
      backgroundColor: semantic.cardMuted,
      marginBottom: 4,
    },
    roomLabel: { fontSize: 9.5, fontWeight: '600', color: semantic.fgMuted, textAlign: 'center' },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md - 2,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 11,
      borderRadius: radius.md,
    },
    btnPrimary: { flex: 1, backgroundColor: semantic.primary, ...shadows.primary },
    btnPrimaryText: { color: semantic.primaryContrast, fontSize: 13.5, fontWeight: '700' },
    btnGhost: {
      paddingHorizontal: spacing.lg,
      backgroundColor: semantic.card,
      borderWidth: 1,
      borderColor: semantic.lineStrong,
    },
    btnGhostText: { color: semantic.fg, fontSize: 13.5, fontWeight: '700' },
    noteChip: {
      flex: 1,
      backgroundColor: semantic.cardMuted,
      borderWidth: 1,
      borderColor: semantic.line,
    },
    noteChipText: { color: semantic.fgMuted, fontSize: 12.5, fontWeight: '600' },
  });
