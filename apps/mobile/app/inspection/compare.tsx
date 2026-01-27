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
                  ? `<img src="${getPhotoUrl(miPhoto.storage_path)}" alt="${miPhoto.caption || room}" />`
                  : '<div class="no-photo">No photo</div>'
              }
              ${miPhoto?.caption ? `<p class="caption">${miPhoto.caption}</p>` : ''}
            </td>
            <td class="photo-cell">
              ${
                moPhoto
                  ? `<img src="${getPhotoUrl(moPhoto.storage_path)}" alt="${moPhoto.caption || room}" />`
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
          <h3>${roomLabels[room] || room}</h3>
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Move-in (${moveInDate})</th>
                <th>Move-out (${moveOutDate})</th>
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
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          padding: 40px;
          ${showWatermark ? 'position: relative;' : ''}
        }
        ${
          showWatermark
            ? `
        body::before {
          content: 'PREVIEW';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 120px;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.05);
          pointer-events: none;
          z-index: 1000;
        }
        `
            : ''
        }
        .header {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 10px;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .meta {
          color: #666;
          font-size: 14px;
        }
        .summary {
          display: flex;
          gap: 40px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .summary-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .summary-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .summary-dot.move-in {
          background: #10b981;
        }
        .summary-dot.move-out {
          background: #f59e0b;
        }
        .room-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        h3 {
          font-size: 18px;
          color: #2563eb;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e5e5;
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
        }
        .comparison-table th {
          background: #f9fafb;
          padding: 10px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #e5e5e5;
        }
        .photo-cell {
          width: 50%;
          padding: 10px;
          vertical-align: top;
          border: 1px solid #e5e5e5;
        }
        .photo-cell img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 4px;
        }
        .no-photo {
          width: 100%;
          height: 200px;
          background: #f5f5f5;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 14px;
        }
        .caption {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">${APP_CONFIG.name}</div>
        <h1>Move-in vs Move-out Comparison</h1>
        <div class="meta">
          <strong>Property:</strong> ${data.propertyAddress}
        </div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-dot move-in"></div>
          <div>
            <strong>Move-in:</strong> ${moveInDate}<br>
            <span style="color: #666">${data.moveInInspection.photos.length} photos</span>
          </div>
        </div>
        <div class="summary-item">
          <div class="summary-dot move-out"></div>
          <div>
            <strong>Move-out:</strong> ${moveOutDate}<br>
            <span style="color: #666">${data.moveOutInspection.photos.length} photos</span>
          </div>
        </div>
      </div>

      ${roomSections || '<p>No photos to compare.</p>'}

      <div class="footer">
        <p>Generated by ${APP_CONFIG.name} on ${generatedDate}</p>
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
