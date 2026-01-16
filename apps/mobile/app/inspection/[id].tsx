/**
 * Inspection Detail Screen - React 19 Pattern
 *
 * Features:
 * - View inspection with all photos
 * - Generate and share PDF report
 * - Mark as complete
 * - Delete inspection
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { format } from 'date-fns';
import { APP_CONFIG } from '@propertycheck/shared';
import {
  fetchInspectionWithPhotos,
  completeInspection,
  deleteInspection,
  generateInspectionPdf,
  getPhotoUrl,
} from '../../lib';
import type { InspectionWithPhotos } from '../../lib';

// Room type labels
const ROOM_TYPE_LABELS: Record<string, string> = {
  living_room: 'Living Room',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  kitchen: 'Kitchen',
  other: 'Other',
};

// Photo thumbnail with loading/error states
function PhotoThumbnail({
  storagePath,
  onPress,
  roomType,
}: {
  storagePath: string;
  onPress: () => void;
  roomType: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const photoUrl = getPhotoUrl(storagePath);

  return (
    <TouchableOpacity style={styles.photoThumbnail} onPress={onPress}>
      {isLoading && (
        <View style={styles.photoPlaceholder}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      )}
      {hasError && (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="image-outline" size={24} color="#999" />
          <Text style={styles.photoErrorText}>Failed to load</Text>
        </View>
      )}
      <Image
        source={{ uri: photoUrl }}
        style={[styles.thumbnailImage, (isLoading || hasError) && { position: 'absolute', opacity: 0 }]}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={(e) => {
          console.error('Image load error:', e.nativeEvent.error, 'URL:', photoUrl);
          setIsLoading(false);
          setHasError(true);
        }}
      />
      <View style={styles.thumbnailBadge}>
        <Text style={styles.thumbnailBadgeText}>
          {ROOM_TYPE_LABELS[roomType || 'other']}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function InspectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [inspection, setInspection] = useState<InspectionWithPhotos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadInspection() {
      if (!id) return;

      try {
        const data = await fetchInspectionWithPhotos(id);
        setInspection(data);
      } catch (err) {
        console.error('Error loading inspection:', err);
        Alert.alert('Error', 'Failed to load inspection', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadInspection();
  }, [id, router]);

  const handleComplete = async () => {
    if (!id || !inspection) return;

    Alert.alert(
      'Complete Inspection',
      'Mark this inspection as complete? This will finalize the inspection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setIsCompleting(true);
            try {
              await completeInspection(id);
              setInspection({ ...inspection, status: 'completed' });
              Alert.alert('Success', 'Inspection marked as complete');
            } catch (err) {
              console.error('Error completing inspection:', err);
              Alert.alert('Error', 'Failed to complete inspection');
            } finally {
              setIsCompleting(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Inspection',
      'Are you sure you want to delete this inspection? This will also delete all photos.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            setIsDeleting(true);
            try {
              await deleteInspection(id);
              Alert.alert('Success', 'Inspection deleted', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (err) {
              console.error('Error deleting inspection:', err);
              Alert.alert('Error', 'Failed to delete inspection');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleGeneratePdf = async () => {
    if (!inspection) return;

    setIsGeneratingPdf(true);
    try {
      const propertyAddress = inspection.property?.address || 'Unknown Property';
      const pdfUri = await generateInspectionPdf(inspection, propertyAddress);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Inspection Report',
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

  const handleSendEmail = async () => {
    if (!inspection) return;

    setIsSendingEmail(true);
    try {
      // Check if mail is available
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Email is not available on this device');
        return;
      }

      // Generate PDF first
      const propertyAddress = inspection.property?.address || 'Unknown Property';
      const pdfUri = await generateInspectionPdf(inspection, propertyAddress);
      const inspectionDate = format(new Date(inspection.inspection_date), 'MMMM d, yyyy');

      // Compose email with PDF attachment
      await MailComposer.composeAsync({
        subject: `Property Inspection Report - ${propertyAddress}`,
        body: `Hello,

Please find attached the property inspection report for:

Property: ${propertyAddress}
Inspection Date: ${inspectionDate}
Status: ${inspection.status === 'completed' ? 'Completed' : 'In Progress'}
Photos: ${inspection.photos?.length || 0}

${inspection.notes ? `Notes: ${inspection.notes}\n\n` : ''}This report was generated using ${APP_CONFIG.name}.

Best regards`,
        attachments: [pdfUri],
        isHtml: false,
      });
    } catch (err) {
      console.error('Error sending email:', err);
      Alert.alert('Error', 'Failed to compose email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Inspection not found</Text>
      </View>
    );
  }

  const isCompleted = inspection.status === 'completed';
  const photoCount = inspection.photos?.length || 0;

  // Photo modal
  if (selectedPhotoIndex !== null && inspection.photos?.[selectedPhotoIndex]) {
    const photo = inspection.photos[selectedPhotoIndex];
    return (
      <Modal visible animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedPhotoIndex(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Image
            source={{ uri: getPhotoUrl(photo.storage_path) }}
            style={styles.modalImage}
            resizeMode="contain"
          />

          <View style={styles.modalInfo}>
            <Text style={styles.modalRoomType}>
              {ROOM_TYPE_LABELS[photo.room_type || 'other']}
            </Text>
            {photo.caption && (
              <Text style={styles.modalCaption}>{photo.caption}</Text>
            )}
          </View>

          <View style={styles.modalNav}>
            <TouchableOpacity
              style={[
                styles.modalNavButton,
                selectedPhotoIndex === 0 && styles.modalNavButtonDisabled,
              ]}
              onPress={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
              disabled={selectedPhotoIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color={selectedPhotoIndex === 0 ? '#666' : '#fff'}
              />
            </TouchableOpacity>

            <Text style={styles.modalCounter}>
              {selectedPhotoIndex + 1} / {photoCount}
            </Text>

            <TouchableOpacity
              style={[
                styles.modalNavButton,
                selectedPhotoIndex === photoCount - 1 && styles.modalNavButtonDisabled,
              ]}
              onPress={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
              disabled={selectedPhotoIndex === photoCount - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={28}
                color={selectedPhotoIndex === photoCount - 1 ? '#666' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          {isDeleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.inspectionDate}>
                {format(new Date(inspection.created_at), 'MMMM d, yyyy')}
              </Text>
              <Text style={styles.inspectionTime}>
                {format(new Date(inspection.created_at), 'h:mm a')}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isCompleted && styles.statusBadgeTextCompleted,
                ]}
              >
                {isCompleted ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>

          {inspection.property && (
            <View style={styles.propertyInfo}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.propertyAddress}>{inspection.property.address}</Text>
            </View>
          )}

          {inspection.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{inspection.notes}</Text>
            </View>
          )}
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos ({photoCount})</Text>

          {photoCount === 0 ? (
            <View style={styles.emptyPhotos}>
              <Ionicons name="images-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No photos</Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {inspection.photos?.map((photo, index) => (
                <PhotoThumbnail
                  key={photo.id}
                  storagePath={photo.storage_path}
                  roomType={photo.room_type || 'other'}
                  onPress={() => setSelectedPhotoIndex(index)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.completeButton, isCompleting && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator color="#166534" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#166534" />
                <Text style={styles.completeButtonText}>Complete</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.pdfButton, isGeneratingPdf && styles.buttonDisabled]}
          onPress={handleGeneratePdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={18} color="#fff" />
              <Text style={styles.pdfButtonText}>PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.emailButton, isSendingEmail && styles.buttonDisabled]}
          onPress={handleSendEmail}
          disabled={isSendingEmail}
        >
          {isSendingEmail ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="mail-outline" size={18} color="#fff" />
              <Text style={styles.emailButtonText}>Email</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inspectionDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  inspectionTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  statusBadgeTextCompleted: {
    color: '#166534',
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 6,
  },
  propertyAddress: {
    flex: 1,
    fontSize: 14,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptyPhotos: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumbnail: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoErrorText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  thumbnailBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  bottomPadding: {
    height: 40,
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
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    gap: 8,
  },
  completeButtonText: {
    color: '#166534',
    fontSize: 15,
    fontWeight: '600',
  },
  pdfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    gap: 8,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#059669',
    gap: 8,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalImage: {
    width: '100%',
    height: '60%',
  },
  modalInfo: {
    padding: 20,
    alignItems: 'center',
  },
  modalRoomType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalCaption: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
    textAlign: 'center',
  },
  modalNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  modalNavButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalNavButtonDisabled: {
    opacity: 0.5,
  },
  modalCounter: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});
