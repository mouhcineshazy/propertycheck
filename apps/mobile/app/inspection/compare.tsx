/**
 * Comparison Report Screen
 *
 * Displays side-by-side comparison of move-in vs move-out inspections.
 * Shows watermark for free tier users with upgrade prompt.
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { ComparisonReport, UpgradeModal } from '../../components';
import { fetchComparisonData, checkBundleAccess } from '../../lib';
import { buildPhotoDataUris, PDF_IMAGE_FALLBACK } from '../../lib/pdfImages';
import type { InspectionWithPhotos } from '../../lib';
import { useTranslation } from '../../contexts';
import { useTheme, useThemedStyles, type AppTheme } from '../../lib/theme';

/**
 * Generate PDF filename from address: {streetNumber}-{streetName}-report.pdf
 */
function generatePdfFilename(address: string): string {
  // Extract street number and name from address
  // Address format typically: "123 Main Street, City, Province"
  const streetPart = address.split(',')[0]?.trim() || address;

  // Match street number and name
  const match = streetPart.match(/^(\d+[-\d]*)\s+(.+)$/);

  if (match) {
    const streetNumber = match[1];
    const streetName = match[2]
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .toLowerCase();
    return `${streetNumber}-${streetName}-report.pdf`;
  }

  // Fallback: sanitize the whole address
  const sanitized = streetPart
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `${sanitized}-report.pdf`;
}

export default function ComparisonScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const th = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [hasBundle, setHasBundle] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    propertyAddress: string;
    moveInInspection: InspectionWithPhotos;
    moveOutInspection: InspectionWithPhotos;
  } | null>(null);
  const [userProvince, setUserProvince] = useState<string | undefined>();

  // Refetch data when screen gains focus (ensures latest inspection data)
  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        if (!propertyId) {
          Alert.alert(t('common.error'), t('errors.generic'), [
            { text: t('common.ok'), onPress: () => router.back() },
          ]);
          return;
        }

        try {
          const supabase = getMobileSupabaseClient();

          // Fetch comparison data, subscription status, and bundle access in parallel
          const [compResult, subResult, userResult, bundleResult] = await Promise.all([
            fetchComparisonData(propertyId),
            supabase.from('subscriptions').select('status').single(),
            supabase.from('users').select('province').single(),
            checkBundleAccess(propertyId),
          ]);

          if (compResult.error || !compResult.data) {
            throw new Error(compResult.error || 'Failed to load comparison data');
          }

          setComparisonData({
            propertyAddress: compResult.data.property.address,
            moveInInspection: compResult.data.moveInInspection,
            moveOutInspection: compResult.data.moveOutInspection,
          });

          setIsPremium(subResult.data?.status === 'premium');
          setHasBundle(bundleResult.hasBundle);
          setUserProvince(userResult.data?.province || undefined);
        } catch (err) {
          console.error('Error loading comparison:', err);
          const message = err instanceof Error ? err.message : t('inspection.compare.loadError');
          Alert.alert(t('alerts.error'), message, [
            { text: t('common.ok'), onPress: () => router.back() },
          ]);
        } finally {
          setIsLoading(false);
        }
      }

      loadData();
    }, [propertyId, router, t])
  );

  const handleGeneratePdf = async () => {
    if (!comparisonData) return;

    // Gate PDF generation behind premium OR moving bundle
    if (!isPremium && !hasBundle) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const imageMap = await buildPhotoDataUris([
        ...comparisonData.moveInInspection.photos.map((p) => p.storage_path),
        ...comparisonData.moveOutInspection.photos.map((p) => p.storage_path),
      ]);
      const html = generateComparisonHtml(comparisonData, imageMap, false, locale as 'en' | 'fr');
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      // Generate filename from address: {streetNumber}-{streetName}-report.pdf
      const pdfFilename = generatePdfFilename(comparisonData.propertyAddress);
      const newUri = `${FileSystem.cacheDirectory}${pdfFilename}`;

      // Move file to new location with proper name
      await FileSystem.moveAsync({ from: uri, to: newUri });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          mimeType: 'application/pdf',
          dialogTitle: t('inspection.compare.shareComparison'),
        });
      } else {
        Alert.alert(t('alerts.success'), t('inspection.compare.pdfGenerated'));
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      Alert.alert(t('alerts.error'), t('inspection.compare.pdfError'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={th.semantic.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!comparisonData) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={th.semantic.danger} />
        <Text style={styles.errorText}>{t('errors.generic')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={th.semantic.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('inspection.compare.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleGeneratePdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color={th.semantic.primary} />
            ) : (
              <Ionicons name="download-outline" size={22} color={th.semantic.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Comparison Report */}
      <ComparisonReport
        propertyAddress={comparisonData.propertyAddress}
        moveInDate={comparisonData.moveInInspection.inspection_date}
        moveOutDate={comparisonData.moveOutInspection.inspection_date}
        moveInPhotos={comparisonData.moveInInspection.photos}
        moveOutPhotos={comparisonData.moveOutInspection.photos}
        showWatermark={!isPremium && !hasBundle}
        onUpgradePress={() => setShowUpgradeModal(true)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="comparison_report"
        userProvince={userProvince}
      />
    </View>
  );
}

// Brand colors - matching logo
const BRAND_COLORS = {
  primary: '#2563eb',      // Blue (Check)
  primaryDark: '#1d4ed8',
  primaryLight: '#3b82f6',
  dark: '#0B1524',         // Dark (Property)
  gray: '#45566E',
  lightGray: '#8695AB',
  background: '#F7F8FA',
  white: '#ffffff',
  success: '#15966E',
  warning: '#f59e0b',
};

/**
 * Generate HTML for comparison PDF report
 */
function generateComparisonHtml(
  data: {
    propertyAddress: string;
    moveInInspection: InspectionWithPhotos;
    moveOutInspection: InspectionWithPhotos;
  },
  imageMap: Map<string, string>,
  showWatermark: boolean,
  locale: 'en' | 'fr' = 'en'
): string {
  const isPremium = !showWatermark;
  const isFr = locale === 'fr';

  // Comparison PDF translations
  const ct = {
    title: isFr ? 'Comparaison Emménagement vs Déménagement' : 'Move-in vs Move-out Comparison',
    property: isFr ? 'Propriété' : 'Property',
    moveIn: isFr ? 'Emménagement' : 'Move-in',
    moveOut: isFr ? 'Déménagement' : 'Move-out',
    photosDocumented: isFr ? 'photos documentées' : 'photos documented',
    photos: 'photos',
    noPhoto: isFr ? 'Aucune photo' : 'No photo',
    noPhotosToCompare: isFr ? 'Aucune photo à comparer.' : 'No photos to compare.',
    roomLabels: {
      living_room: isFr ? 'Salon' : 'Living Room',
      bedroom: isFr ? 'Chambre' : 'Bedroom',
      bathroom: isFr ? 'Salle de bain' : 'Bathroom',
      kitchen: isFr ? 'Cuisine' : 'Kitchen',
      other: isFr ? 'Autres espaces' : 'Other Areas',
    } as Record<string, string>,
  };

  // Free tier uses grayscale colors for a clean B&W look
  const FREE_COLORS = {
    primary: '#2C3B52',
    primaryDark: '#1C2A3E',
    primaryLight: '#63748D',
    dark: '#0B1524',
    gray: '#63748D',
    lightGray: '#8695AB',
    background: '#F7F8FA',
    white: '#ffffff',
    success: '#2C3B52',
    warning: '#63748D',
  };

  // Select color scheme based on tier
  const colors = isPremium ? BRAND_COLORS : FREE_COLORS;

  const dateFormat = isFr ? 'd MMMM yyyy' : 'MMMM d, yyyy';
  const dateLocale = isFr ? { locale: frLocale } : undefined;

  const moveInDate = format(
    new Date(data.moveInInspection.inspection_date),
    dateFormat,
    dateLocale
  );
  const moveOutDate = format(
    new Date(data.moveOutInspection.inspection_date),
    dateFormat,
    dateLocale
  );

  // Group photos by room (room_label, falling back to the category label) so
  // move-in and move-out align on the same room. Track category for ordering.
  const roomLabels = ct.roomLabels;
  const ROOM_ORDER: Record<string, number> = {
    living_room: 1,
    kitchen: 2,
    bedroom: 3,
    bathroom: 4,
    other: 5,
  };
  const labelFor = (photo: (typeof data.moveInInspection.photos)[number]) =>
    photo.room_label || roomLabels[photo.room_type || 'other'] || (photo.room_type || 'other');

  const groupByRoom = (photos: typeof data.moveInInspection.photos) => {
    const map: Record<string, typeof photos> = {};
    photos.forEach((photo) => {
      const key = labelFor(photo);
      if (!map[key]) map[key] = [];
      map[key].push(photo);
    });
    return map;
  };

  const moveInByRoom = groupByRoom(data.moveInInspection.photos);
  const moveOutByRoom = groupByRoom(data.moveOutInspection.photos);

  // Category per room label (for ordering), taken from whichever inspection has it.
  const roomTypeByLabel: Record<string, string> = {};
  [...data.moveInInspection.photos, ...data.moveOutInspection.photos].forEach((photo) => {
    const key = labelFor(photo);
    if (!roomTypeByLabel[key]) roomTypeByLabel[key] = photo.room_type || 'other';
  });

  // Ordered union of room labels: category order, then numeric label order.
  const allRooms = Array.from(
    new Set([...Object.keys(moveInByRoom), ...Object.keys(moveOutByRoom)])
  ).sort((a, b) => {
    const oa = ROOM_ORDER[roomTypeByLabel[a] || 'other'] ?? 99;
    const ob = ROOM_ORDER[roomTypeByLabel[b] || 'other'] ?? 99;
    if (oa !== ob) return oa - ob;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const roomSections = allRooms
    .map((room) => {
      const moveInPhotos = moveInByRoom[room] || [];
      const moveOutPhotos = moveOutByRoom[room] || [];
      const maxCount = Math.max(moveInPhotos.length, moveOutPhotos.length);

      if (maxCount === 0) return '';

      const rows = Array.from({ length: maxCount })
        .map((_, i) => {
          const miPhoto = moveInPhotos[i];
          const moPhoto = moveOutPhotos[i];

          return `
          <tr>
            <td class="photo-cell">
              ${
                miPhoto
                  ? `<div class="photo-wrapper"><img src="${imageMap.get(miPhoto.storage_path) || PDF_IMAGE_FALLBACK}" alt="${miPhoto.caption || room}" /><span class="photo-number">${i + 1}</span></div>`
                  : `<div class="no-photo">${ct.noPhoto}</div>`
              }
              ${miPhoto?.caption ? `<p class="caption">${miPhoto.caption}</p>` : ''}
            </td>
            <td class="photo-cell">
              ${
                moPhoto
                  ? `<div class="photo-wrapper"><img src="${imageMap.get(moPhoto.storage_path) || PDF_IMAGE_FALLBACK}" alt="${moPhoto.caption || room}" /><span class="photo-number">${i + 1}</span></div>`
                  : `<div class="no-photo">${ct.noPhoto}</div>`
              }
              ${moPhoto?.caption ? `<p class="caption">${moPhoto.caption}</p>` : ''}
            </td>
          </tr>
        `;
        })
        .join('');

      return `
        <div class="room-section">
          <div class="room-header">
            <h3>${room}</h3>
            <span class="photo-count">${moveInPhotos.length + moveOutPhotos.length} ${ct.photos}</span>
          </div>
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="move-in-header">
                  <span class="header-dot move-in"></span>
                  ${ct.moveIn} (${moveInDate})
                </th>
                <th class="move-out-header">
                  <span class="header-dot move-out"></span>
                  ${ct.moveOut} (${moveOutDate})
                </th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join('');

  // Tier badge (only show for premium)
  const tierBadge = isPremium
    ? `<span class="tier-badge premium">Premium</span>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Comparison Report - ${data.propertyAddress}</title>
      <style>
        :root {
          --primary: ${colors.primary};
          --primary-dark: ${colors.primaryDark};
          --ink: ${colors.dark};
          --gray: ${colors.gray};
          --muted: ${colors.lightGray};
          --bg: ${colors.background};
          --line: #e5e7eb;
          --line-strong: #cbd5e1;
          --move-in: #15966e;
          --move-out: #d97706;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page { size: letter; margin: 14mm 14mm 16mm 14mm; }

        html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10.5pt;
          line-height: 1.5;
          color: var(--ink);
          background: #ffffff;
        }

        .content-wrapper { }

        /* ---------- Header ---------- */
        .header {
          border-bottom: 2px solid var(--primary);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .brand { display: flex; align-items: center; gap: 9px; }
        .logo { font-size: 16pt; font-weight: 800; letter-spacing: -0.4px; }
        .logo-property { color: var(--ink); }
        .logo-check { color: var(--primary); }
        .tier-badge {
          padding: 3px 8px; border: 1px solid var(--line-strong); border-radius: 4px;
          font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;
          color: var(--gray); background: #fff;
        }
        .tier-badge.premium { color: var(--primary); border-color: var(--primary); }
        h1 { font-size: 20pt; font-weight: 700; color: var(--ink); letter-spacing: -0.5px; margin-bottom: 4px; }
        .meta { font-size: 10.5pt; color: var(--gray); }
        .meta strong { color: var(--ink); font-weight: 600; }

        /* ---------- Summary legend ---------- */
        .summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 22px;
        }
        .summary-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border: 1px solid var(--line); border-radius: 6px;
        }
        .summary-item.move-in-item { border-left: 3px solid var(--move-in); }
        .summary-item.move-out-item { border-left: 3px solid var(--move-out); }
        .summary-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .summary-dot.move-in { background: var(--move-in); }
        .summary-dot.move-out { background: var(--move-out); }
        .summary-info { display: flex; flex-direction: column; }
        .summary-info strong { font-size: 10.5pt; color: var(--ink); }
        .summary-info span { font-size: 8.5pt; color: var(--gray); }

        /* ---------- Room ---------- */
        .room-section { margin-bottom: 22px; page-break-inside: avoid; }
        .room-header {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 0 6px 12px; margin-bottom: 10px;
          border-left: 3px solid var(--primary);
        }
        .room-header h3 { font-size: 12pt; font-weight: 700; color: var(--ink); flex: 1; letter-spacing: -0.2px; }
        .photo-count { font-size: 8.5pt; font-weight: 600; color: var(--gray); white-space: nowrap; }

        /* ---------- Comparison table ---------- */
        .comparison-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .comparison-table th {
          width: 50%;
          text-align: left;
          font-size: 8.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--gray);
          padding: 0 0 8px 0;
          border-bottom: 1px solid var(--line-strong);
        }
        .comparison-table th:first-child { padding-right: 7px; }
        .comparison-table th:last-child { padding-left: 7px; }
        .header-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
        .header-dot.move-in { background: var(--move-in); }
        .header-dot.move-out { background: var(--move-out); }
        .comparison-table tr { page-break-inside: avoid; }
        .photo-cell { width: 50%; vertical-align: top; padding: 12px 7px 0 0; }
        .comparison-table td.photo-cell:last-child { padding: 12px 0 0 7px; }
        .photo-wrapper {
          position: relative;
          border: 1px solid var(--line-strong);
          border-radius: 4px;
          overflow: hidden;
          background: #f1f5f9;
        }
        .photo-wrapper img { width: 100%; height: 185px; object-fit: cover; display: block; }
        .photo-number {
          position: absolute; top: 7px; left: 7px;
          background: rgba(15, 23, 42, 0.82); color: #fff;
          font-size: 8pt; font-weight: 700; min-width: 20px; height: 20px; padding: 0 6px;
          border-radius: 3px; display: flex; align-items: center; justify-content: center;
        }
        .no-photo {
          height: 185px;
          border: 1px dashed var(--line-strong);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 9pt; color: var(--muted);
          background: #fafafa;
        }
        .caption { font-size: 8.5pt; color: var(--gray); line-height: 1.35; margin-top: 6px; }

        @media print {
          .room-section, .comparison-table tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>

      <div class="content-wrapper">
      <div class="header">
        <div class="header-top">
          <div class="brand">
            <span class="logo"><span class="logo-property">Property</span><span class="logo-check">Check</span></span>
            ${tierBadge}
          </div>
        </div>
        <h1>${ct.title}</h1>
        <div class="meta">
          <strong>${ct.property}:</strong> ${data.propertyAddress}
        </div>
      </div>

      <div class="summary">
        <div class="summary-item move-in-item">
          <div class="summary-dot move-in"></div>
          <div class="summary-info">
            <strong>${ct.moveIn}: ${moveInDate}</strong>
            <span>${data.moveInInspection.photos.length} ${ct.photosDocumented}</span>
          </div>
        </div>
        <div class="summary-item move-out-item">
          <div class="summary-dot move-out"></div>
          <div class="summary-info">
            <strong>${ct.moveOut}: ${moveOutDate}</strong>
            <span>${data.moveOutInspection.photos.length} ${ct.photosDocumented}</span>
          </div>
        </div>
      </div>

      ${roomSections || `<p style="text-align: center; color: #666; padding: 40px;">${ct.noPhotosToCompare}</p>`}
      </div><!-- end content-wrapper -->
    </body>
    </html>
  `;
}

const makeStyles = (th: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: th.semantic.canvas,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: th.semantic.canvas,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: th.semantic.fgMuted,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: th.semantic.fgMuted,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: th.semantic.primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: th.semantic.card,
    borderBottomWidth: 1,
    borderBottomColor: th.semantic.line,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: th.semantic.fg,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
