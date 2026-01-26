/**
 * ComparisonReport Component
 *
 * Displays side-by-side comparison of move-in vs move-out inspection photos.
 * Shows watermark for free tier users.
 */

import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { RoomType, InspectionPhoto } from '@propertycheck/database';
import { getPhotoUrl } from '../lib';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = (SCREEN_WIDTH - 48) / 2; // Account for padding and gap

// Room type labels
const ROOM_TYPE_LABELS: Record<string, string> = {
  living_room: 'Living Room',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  kitchen: 'Kitchen',
  other: 'Other',
};

// Room type order for display
const ROOM_ORDER: RoomType[] = ['living_room', 'bedroom', 'bathroom', 'kitchen', 'other'];

interface ComparisonReportProps {
  propertyAddress: string;
  moveInDate: string;
  moveOutDate: string;
  moveInPhotos: InspectionPhoto[];
  moveOutPhotos: InspectionPhoto[];
  showWatermark: boolean;
  onUpgradePress?: () => void;
}

// Photo thumbnail with loading state
function ComparisonPhoto({
  photo,
  label,
  date,
  onPress,
}: {
  photo: InspectionPhoto | null;
  label: string;
  date: string;
  onPress?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!photo) {
    return (
      <View style={styles.photoContainer}>
        <View style={styles.emptyPhoto}>
          <Ionicons name="image-outline" size={32} color="#ccc" />
          <Text style={styles.emptyText}>No photo</Text>
        </View>
        <View style={styles.photoLabel}>
          <Text style={styles.photoLabelText}>{label}</Text>
          <Text style={styles.photoDate}>{date}</Text>
        </View>
      </View>
    );
  }

  const photoUrl = getPhotoUrl(photo.storage_path);

  return (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={onPress}
      disabled={!onPress}
    >
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      )}
      {hasError && (
        <View style={styles.errorOverlay}>
          <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load</Text>
        </View>
      )}
      <Image
        source={{ uri: photoUrl }}
        style={[styles.photo, (isLoading || hasError) && styles.hiddenPhoto]}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      <View style={styles.photoLabel}>
        <Text style={styles.photoLabelText}>{label}</Text>
        <Text style={styles.photoDate}>{date}</Text>
      </View>
      {photo.caption && (
        <Text style={styles.caption} numberOfLines={2}>
          {photo.caption}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Room section with paired photos
function RoomSection({
  roomType,
  moveInPhotos,
  moveOutPhotos,
  moveInDate,
  moveOutDate,
  onPhotoPress,
}: {
  roomType: RoomType;
  moveInPhotos: InspectionPhoto[];
  moveOutPhotos: InspectionPhoto[];
  moveInDate: string;
  moveOutDate: string;
  onPhotoPress: (photo: InspectionPhoto) => void;
}) {
  // Get max count to ensure we show all photos
  const maxCount = Math.max(moveInPhotos.length, moveOutPhotos.length);

  if (maxCount === 0) return null;

  return (
    <View style={styles.roomSection}>
      <View style={styles.roomHeader}>
        <Ionicons
          name={
            roomType === 'bedroom'
              ? 'bed-outline'
              : roomType === 'bathroom'
                ? 'water-outline'
                : roomType === 'kitchen'
                  ? 'restaurant-outline'
                  : roomType === 'living_room'
                    ? 'tv-outline'
                    : 'grid-outline'
          }
          size={20}
          color="#2563eb"
        />
        <Text style={styles.roomTitle}>{ROOM_TYPE_LABELS[roomType]}</Text>
        <Text style={styles.photoCount}>
          {moveInPhotos.length + moveOutPhotos.length} photos
        </Text>
      </View>

      {Array.from({ length: maxCount }).map((_, index) => (
        <View key={index} style={styles.comparisonRow}>
          <ComparisonPhoto
            photo={moveInPhotos[index] || null}
            label="Move-in"
            date={moveInDate}
            onPress={
              moveInPhotos[index]
                ? () => onPhotoPress(moveInPhotos[index])
                : undefined
            }
          />
          <View style={styles.arrow}>
            <Ionicons name="arrow-forward" size={16} color="#999" />
          </View>
          <ComparisonPhoto
            photo={moveOutPhotos[index] || null}
            label="Move-out"
            date={moveOutDate}
            onPress={
              moveOutPhotos[index]
                ? () => onPhotoPress(moveOutPhotos[index])
                : undefined
            }
          />
        </View>
      ))}
    </View>
  );
}

// Watermark overlay component
function WatermarkOverlay({ onUpgradePress }: { onUpgradePress?: () => void }) {
  return (
    <View style={styles.watermarkContainer} pointerEvents="box-none">
      <View style={styles.watermarkBanner}>
        <View style={styles.watermarkContent}>
          <Ionicons name="lock-closed" size={20} color="#fff" />
          <View style={styles.watermarkText}>
            <Text style={styles.watermarkTitle}>Preview Mode</Text>
            <Text style={styles.watermarkSubtitle}>
              Upgrade to save & share clean reports
            </Text>
          </View>
        </View>
        {onUpgradePress && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Diagonal watermark text */}
      <View style={styles.diagonalWatermark} pointerEvents="none">
        <Text style={styles.diagonalText}>PREVIEW</Text>
      </View>
    </View>
  );
}

export function ComparisonReport({
  propertyAddress,
  moveInDate,
  moveOutDate,
  moveInPhotos,
  moveOutPhotos,
  showWatermark,
  onUpgradePress,
}: ComparisonReportProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<InspectionPhoto | null>(null);

  // Group photos by room type
  const groupByRoom = (photos: InspectionPhoto[]) => {
    return photos.reduce(
      (acc, photo) => {
        const room = photo.room_type || 'other';
        if (!acc[room]) acc[room] = [];
        acc[room].push(photo);
        return acc;
      },
      {} as Record<RoomType, InspectionPhoto[]>
    );
  };

  const moveInByRoom = groupByRoom(moveInPhotos);
  const moveOutByRoom = groupByRoom(moveOutPhotos);

  // Get all room types that have photos
  const allRooms = new Set([
    ...Object.keys(moveInByRoom),
    ...Object.keys(moveOutByRoom),
  ]);

  // Sort rooms in preferred order
  const sortedRooms = ROOM_ORDER.filter((room) => allRooms.has(room));

  const formattedMoveIn = format(new Date(moveInDate), 'MMM d, yyyy');
  const formattedMoveOut = format(new Date(moveOutDate), 'MMM d, yyyy');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comparison Report</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.address}>{propertyAddress}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#10b981' }]} />
            <View>
              <Text style={styles.summaryLabel}>Move-in</Text>
              <Text style={styles.summaryDate}>{formattedMoveIn}</Text>
            </View>
            <Text style={styles.summaryCount}>{moveInPhotos.length} photos</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#f59e0b' }]} />
            <View>
              <Text style={styles.summaryLabel}>Move-out</Text>
              <Text style={styles.summaryDate}>{formattedMoveOut}</Text>
            </View>
            <Text style={styles.summaryCount}>{moveOutPhotos.length} photos</Text>
          </View>
        </View>

        {/* Room Sections */}
        {sortedRooms.map((room) => (
          <RoomSection
            key={room}
            roomType={room as RoomType}
            moveInPhotos={moveInByRoom[room as RoomType] || []}
            moveOutPhotos={moveOutByRoom[room as RoomType] || []}
            moveInDate={formattedMoveIn}
            moveOutDate={formattedMoveOut}
            onPhotoPress={setSelectedPhoto}
          />
        ))}

        {sortedRooms.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No photos to compare</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Watermark overlay for free tier */}
      {showWatermark && <WatermarkOverlay onUpgradePress={onUpgradePress} />}

      {/* Full-screen photo modal */}
      {selectedPhoto && (
        <Modal visible animationType="fade" transparent>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: getPhotoUrl(selectedPhoto.storage_path) }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <View style={styles.modalInfo}>
              <Text style={styles.modalRoomType}>
                {ROOM_TYPE_LABELS[selectedPhoto.room_type || 'other']}
              </Text>
              {selectedPhoto.caption && (
                <Text style={styles.modalCaption}>{selectedPhoto.caption}</Text>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summary: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryDate: {
    fontSize: 12,
    color: '#666',
  },
  summaryCount: {
    marginLeft: 'auto',
    fontSize: 13,
    color: '#666',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },
  roomSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  photoCount: {
    fontSize: 12,
    color: '#666',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoContainer: {
    width: PHOTO_WIDTH,
  },
  photo: {
    width: '100%',
    height: PHOTO_WIDTH,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  hiddenPhoto: {
    opacity: 0,
    position: 'absolute',
  },
  emptyPhoto: {
    width: '100%',
    height: PHOTO_WIDTH,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PHOTO_WIDTH,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PHOTO_WIDTH,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
  },
  photoLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  photoLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  photoDate: {
    fontSize: 10,
    color: '#999',
  },
  caption: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  arrow: {
    width: 24,
    alignItems: 'center',
    marginTop: -20, // Offset to align with photos
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  bottomPadding: {
    height: 120, // Extra space for watermark banner
  },
  // Watermark styles
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  watermarkBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  watermarkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  watermarkText: {
    flex: 1,
  },
  watermarkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  watermarkSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  diagonalWatermark: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ rotate: '-30deg' }],
  },
  diagonalText: {
    fontSize: 64,
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.06)',
    letterSpacing: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
});
