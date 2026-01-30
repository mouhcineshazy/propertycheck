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
import { format } from 'date-fns';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { APP_CONFIG } from '@propertycheck/shared';
import { ComparisonReport, UpgradeModal } from '../../components';
import { fetchComparisonData, getPhotoUrl } from '../../lib';
import type { InspectionWithPhotos } from '../../lib';

export default function ComparisonScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
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
          Alert.alert('Error', 'No property specified', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }

        try {
          const supabase = getMobileSupabaseClient();

          // Fetch comparison data and subscription status in parallel
          const [compResult, subResult, userResult] = await Promise.all([
            fetchComparisonData(propertyId),
            supabase.from('subscriptions').select('status').single(),
            supabase.from('users').select('province').single(),
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
          setUserProvince(userResult.data?.province || undefined);
        } catch (err) {
          console.error('Error loading comparison:', err);
          const message = err instanceof Error ? err.message : 'Failed to load comparison';
          Alert.alert('Error', message, [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } finally {
          setIsLoading(false);
        }
      }

      loadData();
    }, [propertyId, router])
  );

  const handleGeneratePdf = async () => {
    if (!comparisonData) return;

    // For free tier, show upgrade modal
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const html = generateComparisonHtml(comparisonData, false);
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Comparison Report',
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    // TODO: Implement shareable link generation
    Alert.alert('Coming Soon', 'Shareable links will be available soon!');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading comparison...</Text>
      </View>
    );
  }

  if (!comparisonData) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load comparison</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comparison</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShare}
            disabled={isGeneratingPdf}
          >
            <Ionicons name="share-outline" size={22} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleGeneratePdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Ionicons name="download-outline" size={22} color="#2563eb" />
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
        showWatermark={!isPremium}
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
  dark: '#0f172a',         // Dark (Property)
  gray: '#64748b',
  lightGray: '#94a3b8',
  background: '#f8fafc',
  white: '#ffffff',
  success: '#22c55e',
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
  showWatermark: boolean
): string {
  const isPremium = !showWatermark;
  const moveInDate = format(
    new Date(data.moveInInspection.inspection_date),
    'MMMM d, yyyy'
  );
  const moveOutDate = format(
    new Date(data.moveOutInspection.inspection_date),
    'MMMM d, yyyy'
  );
  const generatedDate = format(new Date(), 'MMMM d, yyyy');

  // Group photos by room type
  const groupByRoom = (photos: typeof data.moveInInspection.photos) => {
    return photos.reduce(
      (acc, photo) => {
        const room = photo.room_type || 'other';
        if (!acc[room]) acc[room] = [];
        acc[room].push(photo);
        return acc;
      },
      {} as Record<string, typeof photos>
    );
  };

  const moveInByRoom = groupByRoom(data.moveInInspection.photos);
  const moveOutByRoom = groupByRoom(data.moveOutInspection.photos);

  const roomLabels: Record<string, string> = {
    living_room: 'Living Room',
    bedroom: 'Bedroom',
    bathroom: 'Bathroom',
    kitchen: 'Kitchen',
    other: 'Other Areas',
  };

  const roomIcons: Record<string, string> = {
    living_room: '🏠',
    bedroom: '🛏️',
    bathroom: '🚿',
    kitchen: '🍳',
    other: '📷',
  };

  // Generate comparison sections
  const allRooms = new Set([
    ...Object.keys(moveInByRoom),
    ...Object.keys(moveOutByRoom),
  ]);

  const roomSections = Array.from(allRooms)
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
                  ? `<div class="photo-wrapper"><img src="${getPhotoUrl(miPhoto.storage_path)}" alt="${miPhoto.caption || room}" /><span class="photo-number">${i + 1}</span></div>`
                  : '<div class="no-photo">No photo</div>'
              }
              ${miPhoto?.caption ? `<p class="caption">${miPhoto.caption}</p>` : ''}
            </td>
            <td class="photo-cell">
              ${
                moPhoto
                  ? `<div class="photo-wrapper"><img src="${getPhotoUrl(moPhoto.storage_path)}" alt="${moPhoto.caption || room}" /><span class="photo-number">${i + 1}</span></div>`
                  : '<div class="no-photo">No photo</div>'
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
            <span class="room-icon">${roomIcons[room] || '📷'}</span>
            <h3>${roomLabels[room] || room}</h3>
            <span class="photo-count">${moveInPhotos.length + moveOutPhotos.length} photos</span>
          </div>
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="move-in-header">
                  <span class="header-dot move-in"></span>
                  Move-in (${moveInDate})
                </th>
                <th class="move-out-header">
                  <span class="header-dot move-out"></span>
                  Move-out (${moveOutDate})
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

  // Tier badge
  const tierBadge = isPremium
    ? `<span class="tier-badge premium">Premium</span>`
    : `<span class="tier-badge free">Free</span>`;

  // Watermark styles for free tier
  const watermarkStyles = showWatermark
    ? `
        body::before {
          content: 'FREE VERSION';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-size: 100px;
          font-weight: 900;
          color: rgba(37, 99, 235, 0.06);
          pointer-events: none;
          z-index: 1000;
          white-space: nowrap;
        }
      `
    : '';

  // Upgrade banner for free tier
  const upgradeSection = showWatermark
    ? `
      <div class="upgrade-banner">
        <div class="upgrade-content">
          <div class="upgrade-icon">⭐</div>
          <div class="upgrade-text">
            <p class="upgrade-title">Upgrade to Premium</p>
            <p class="upgrade-desc">Remove watermark, get unlimited comparison reports, and download high-quality PDFs</p>
          </div>
        </div>
        <div class="upgrade-url">propertycheck.app/upgrade</div>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Comparison Report - ${data.propertyAddress}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @page {
          margin: 0.75in;
          size: letter;
        }

        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: ${BRAND_COLORS.dark};
          padding: 40px;
        }

        ${watermarkStyles}

        /* Header */
        .header {
          border-bottom: 4px solid ${BRAND_COLORS.primary};
          padding-bottom: 24px;
          margin-bottom: 30px;
          ${isPremium ? `background: linear-gradient(135deg, ${BRAND_COLORS.background} 0%, ${BRAND_COLORS.white} 100%); margin: -40px -40px 30px -40px; padding: 40px 40px 24px 40px;` : ''}
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .logo-property {
          color: ${BRAND_COLORS.dark};
        }

        .logo-check {
          color: ${BRAND_COLORS.primary};
        }

        .tier-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tier-badge.premium {
          background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
          color: ${BRAND_COLORS.white};
        }

        .tier-badge.free {
          background: ${BRAND_COLORS.background};
          color: ${BRAND_COLORS.gray};
          border: 1px solid #e2e8f0;
        }

        h1 {
          font-size: 26px;
          font-weight: 700;
          color: ${BRAND_COLORS.dark};
          margin-bottom: 8px;
        }

        .meta {
          color: ${BRAND_COLORS.gray};
          font-size: 14px;
        }

        .meta strong {
          color: ${BRAND_COLORS.dark};
        }

        /* Summary */
        .summary {
          display: flex;
          gap: 24px;
          margin-bottom: 30px;
          padding: 20px;
          background: ${isPremium ? BRAND_COLORS.white : BRAND_COLORS.background};
          border-radius: 12px;
          ${isPremium ? `border: 2px solid ${BRAND_COLORS.primary}20; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);` : ''}
        }

        .summary-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: ${BRAND_COLORS.background};
          border-radius: 10px;
          ${isPremium ? 'border-left: 4px solid;' : ''}
        }

        .summary-item.move-in-item {
          ${isPremium ? `border-left-color: ${BRAND_COLORS.success};` : ''}
        }

        .summary-item.move-out-item {
          ${isPremium ? `border-left-color: ${BRAND_COLORS.warning};` : ''}
        }

        .summary-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .summary-dot.move-in {
          background: ${BRAND_COLORS.success};
        }

        .summary-dot.move-out {
          background: ${BRAND_COLORS.warning};
        }

        .summary-info strong {
          display: block;
          font-size: 13px;
          color: ${BRAND_COLORS.dark};
          margin-bottom: 2px;
        }

        .summary-info span {
          font-size: 12px;
          color: ${BRAND_COLORS.gray};
        }

        /* Room Section */
        .room-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }

        .room-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: ${isPremium ? `linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)` : '#f0f9ff'};
          border-radius: 10px;
          ${isPremium ? `border-left: 4px solid ${BRAND_COLORS.primary};` : ''}
        }

        .room-icon {
          font-size: 20px;
        }

        .room-header h3 {
          flex: 1;
          font-size: 15px;
          font-weight: 600;
          color: ${BRAND_COLORS.primaryDark};
          margin: 0;
          border: none;
          padding: 0;
        }

        .photo-count {
          font-size: 11px;
          color: ${BRAND_COLORS.gray};
          background: ${BRAND_COLORS.white};
          padding: 4px 12px;
          border-radius: 12px;
        }

        /* Comparison Table */
        .comparison-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 12px;
          overflow: hidden;
          ${isPremium ? `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);` : ''}
        }

        .comparison-table th {
          background: ${BRAND_COLORS.background};
          padding: 14px 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: ${BRAND_COLORS.dark};
          border-bottom: 2px solid #e5e5e5;
        }

        .move-in-header {
          border-right: 1px solid #e5e5e5;
        }

        .header-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 8px;
          vertical-align: middle;
        }

        .header-dot.move-in {
          background: ${BRAND_COLORS.success};
        }

        .header-dot.move-out {
          background: ${BRAND_COLORS.warning};
        }

        .photo-cell {
          width: 50%;
          padding: 12px;
          vertical-align: top;
          border-bottom: 1px solid #e5e5e5;
          background: ${BRAND_COLORS.white};
        }

        .photo-cell:first-child {
          border-right: 1px solid #e5e5e5;
        }

        .photo-wrapper {
          position: relative;
          border-radius: ${isPremium ? '10px' : '6px'};
          overflow: hidden;
          ${isPremium ? `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);` : ''}
        }

        .photo-cell img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .photo-number {
          position: absolute;
          top: 8px;
          left: 8px;
          background: ${isPremium ? BRAND_COLORS.primary : 'rgba(0, 0, 0, 0.7)'};
          color: ${BRAND_COLORS.white};
          font-size: 10px;
          font-weight: 600;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .no-photo {
          width: 100%;
          height: 200px;
          background: ${BRAND_COLORS.background};
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${BRAND_COLORS.lightGray};
          font-size: 13px;
        }

        .caption {
          font-size: 11px;
          color: ${BRAND_COLORS.gray};
          margin-top: 8px;
          line-height: 1.4;
        }

        /* Upgrade Banner */
        .upgrade-banner {
          margin-top: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          border: 2px dashed #f59e0b;
        }

        .upgrade-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .upgrade-icon {
          font-size: 32px;
        }

        .upgrade-text {
          flex: 1;
        }

        .upgrade-title {
          font-size: 15px;
          font-weight: 700;
          color: ${BRAND_COLORS.dark};
          margin-bottom: 4px;
        }

        .upgrade-desc {
          font-size: 12px;
          color: #92400e;
        }

        .upgrade-url {
          margin-top: 12px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: ${BRAND_COLORS.primary};
          background: ${BRAND_COLORS.white};
          padding: 10px 16px;
          border-radius: 8px;
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 3px solid ${isPremium ? BRAND_COLORS.primary : '#e5e5e5'};
          text-align: center;
        }

        .footer p {
          font-size: 11px;
          color: ${BRAND_COLORS.gray};
          margin-bottom: 4px;
        }

        .footer-brand {
          font-weight: 700;
        }

        .footer-brand .brand-property {
          color: ${BRAND_COLORS.dark};
        }

        .footer-brand .brand-check {
          color: ${BRAND_COLORS.primary};
        }

        /* Print */
        @media print {
          .room-section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-top">
          <div class="brand">
            <span class="logo"><span class="logo-property">Property</span><span class="logo-check">Check</span></span>
            ${tierBadge}
          </div>
        </div>
        <h1>Move-in vs Move-out Comparison</h1>
        <div class="meta">
          <strong>Property:</strong> ${data.propertyAddress}
        </div>
      </div>

      <div class="summary">
        <div class="summary-item move-in-item">
          <div class="summary-dot move-in"></div>
          <div class="summary-info">
            <strong>Move-in: ${moveInDate}</strong>
            <span>${data.moveInInspection.photos.length} photos documented</span>
          </div>
        </div>
        <div class="summary-item move-out-item">
          <div class="summary-dot move-out"></div>
          <div class="summary-info">
            <strong>Move-out: ${moveOutDate}</strong>
            <span>${data.moveOutInspection.photos.length} photos documented</span>
          </div>
        </div>
      </div>

      ${roomSections || '<p style="text-align: center; color: #666; padding: 40px;">No photos to compare.</p>'}

      ${upgradeSection}

      <div class="footer">
        <p>Generated by <span class="footer-brand"><span class="brand-property">Property</span><span class="brand-check">Check</span></span> on ${generatedDate}</p>
        <p>${APP_CONFIG.supportEmail}</p>
      </div>
    </body>
    </html>
  `;
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
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
