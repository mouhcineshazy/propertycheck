/**
 * New Inspection Screen - room-by-room documentation.
 *
 * Flow: add a room (category → auto-numbered, e.g. "Bedroom 1"), attach up to
 * MAX_PHOTOS_PER_ROOM photos to it (camera or library), repeat. Photos are
 * compressed on upload (see lib/image). Free-tier inspection + total-photo caps
 * still apply.
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  ROOM_TYPES,
  MAX_PHOTOS_PER_ROOM,
  MAX_ROOMS_PER_INSPECTION,
  MAX_ROOM_NAME_LENGTH,
  FREE_TIER_LIMITS,
  PREMIUM_TIER_LIMITS,
  type RoomTypeValue,
} from '@propertycheck/shared';
import { getMobileSupabaseClient } from '../../lib/supabase';
import { createInspection, getPropertyInspectionAccess } from '../../lib';
import { compressImage } from '../../lib/image';
import { mapLimit } from '../../lib/concurrency';
import type { LocalPhoto } from '../../lib';
import { useTheme, useThemedStyles, type AppTheme } from '../../lib/theme';

type Room = {
  id: string;
  room_type: RoomTypeValue;
  label: string;
  photos: LocalPhoto[];
};

export default function NewInspectionScreen() {
  const router = useRouter();
  const th = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{ roomId: string; index: number } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  // Free tier limit enforcement
  const [isCheckingLimits, setIsCheckingLimits] = useState(true);
  const [maxTotalPhotos, setMaxTotalPhotos] = useState<number>(FREE_TIER_LIMITS.maxPhotosPerInspection);

  const totalPhotos = rooms.reduce((sum, room) => sum + room.photos.length, 0);

  useEffect(() => {
    async function checkLimits() {
      if (!propertyId) {
        setIsCheckingLimits(false);
        return;
      }
      try {
        const supabase = getMobileSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        const [access, subResult] = await Promise.all([
          getPropertyInspectionAccess(propertyId),
          user
            ? supabase.from('subscriptions').select('status').eq('user_id', user.id).single()
            : Promise.resolve({ data: null }),
        ]);

        const isPremium = subResult.data?.status === 'premium';
        setMaxTotalPhotos(
          isPremium
            ? PREMIUM_TIER_LIMITS.maxPhotosPerInspection
            : FREE_TIER_LIMITS.maxPhotosPerInspection
        );

        // Per-property rule: at most 2 completed inspections, and a bundle
        // finalizes the property. Entry is normally gated upstream; guard the
        // deep-link case here (the DB trigger is the hard backstop).
        if (!access.canAdd) {
          Alert.alert(
            access.isLocked ? 'Property finalized' : 'Inspection limit reached',
            access.isLocked
              ? 'This property has been finalized with a Moving Bundle and can no longer be changed.'
              : 'This property already has 2 completed inspections (move-in and move-out).',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
      } catch (err) {
        console.error('Error checking limits:', err);
        Alert.alert('Error', 'Could not verify this property. Please try again.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        setIsCheckingLimits(false);
      }
    }

    checkLimits();
  }, [propertyId, router]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  const genRoomId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Make a label unique within the inspection by appending a number if needed.
  const uniqueLabel = (base: string) => {
    const existing = new Set(rooms.map((r) => r.label.toLowerCase()));
    if (!existing.has(base.toLowerCase())) return base;
    let n = 2;
    while (existing.has(`${base} ${n}`.toLowerCase())) n++;
    return `${base} ${n}`;
  };

  const addRoomWithLimit = (room: Room): boolean => {
    if (rooms.length >= MAX_ROOMS_PER_INSPECTION) {
      Alert.alert('Room limit reached', `An inspection can have up to ${MAX_ROOMS_PER_INSPECTION} rooms.`);
      return false;
    }
    setRooms((prev) => [...prev, room]);
    setActiveRoomId(room.id);
    return true;
  };

  const addRoom = (category: (typeof ROOM_TYPES)[number]) => {
    const count = rooms.filter((r) => r.room_type === category.value).length;
    const room: Room = {
      id: genRoomId(),
      room_type: category.value,
      label: `${category.label} ${count + 1}`,
      photos: [],
    };
    if (addRoomWithLimit(room)) setShowRoomPicker(false);
  };

  const addCustomRoom = () => {
    const name = customRoomName.trim();
    if (!name) return;
    const room: Room = {
      id: genRoomId(),
      room_type: 'other',
      label: uniqueLabel(name),
      photos: [],
    };
    if (addRoomWithLimit(room)) {
      setCustomRoomName('');
      setShowRoomPicker(false);
    }
  };

  const removeRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  // Add photos to a room, enforcing the per-room and per-inspection caps.
  const addPhotosToRoom = async (roomId: string, incoming: LocalPhoto[]) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const roomRemaining = MAX_PHOTOS_PER_ROOM - room.photos.length;
    const totalRemaining = maxTotalPhotos - totalPhotos;
    const allowed = Math.max(0, Math.min(roomRemaining, totalRemaining));

    if (allowed <= 0) {
      Alert.alert(
        'Photo limit reached',
        roomRemaining <= 0
          ? `Each room can hold up to ${MAX_PHOTOS_PER_ROOM} photos.`
          : `This inspection can hold up to ${maxTotalPhotos} photos.`
      );
      return;
    }

    const toAdd = incoming.slice(0, allowed);

    // Compress at capture time so submit stays upload-only and previews are
    // lightweight. compressImage falls back to the original uri on failure.
    setIsAddingPhotos(true);
    try {
      const compressed = await mapLimit(toAdd, 4, async (p) => ({
        ...p,
        uri: await compressImage(p.uri),
      }));
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, photos: [...r.photos, ...compressed] } : r))
      );
    } finally {
      setIsAddingPhotos(false);
    }

    if (toAdd.length < incoming.length) {
      Alert.alert('Some photos skipped', `Only ${toAdd.length} photo(s) fit within the limit.`);
    }
  };

  const updatePhotoCaption = (roomId: string, index: number, caption: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, photos: r.photos.map((p, i) => (i === index ? { ...p, caption } : p)) }
          : r
      )
    );
  };

  const removePhoto = (roomId: string, index: number) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, photos: r.photos.filter((_, i) => i !== index) } : r))
    );
    setSelectedPhoto(null);
  };

  const handleOpenCamera = async (roomId: string) => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.');
        return;
      }
    }
    setActiveRoomId(roomId);
    setIsCameraActive(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || !activeRoomId) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setIsCameraActive(false);
        await addPhotosToRoom(activeRoomId, [{ uri: photo.uri, caption: '' }]);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickImage = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    const selectionLimit = Math.max(1, MAX_PHOTOS_PER_ROOM - room.photos.length);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit,
      quality: 0.8,
    });

    if (!result.canceled) {
      await addPhotosToRoom(
        roomId,
        result.assets.map((asset) => ({ uri: asset.uri, caption: '' }))
      );
    }
  };

  const handleSubmit = async () => {
    if (!propertyId) {
      Alert.alert('Error', 'Property ID is required');
      return;
    }
    if (totalPhotos === 0) {
      Alert.alert('Photos Required', 'Add at least one room with a photo before saving.');
      return;
    }

    // Flatten rooms into photos, tagging each with its room category + label.
    const photos: LocalPhoto[] = [];
    rooms.forEach((room) => {
      room.photos.forEach((p) => {
        photos.push({ ...p, room_type: room.room_type, room_label: room.label });
      });
    });

    setIsSubmitting(true);
    setUploadProgress({ done: 0, total: photos.length });
    try {
      await createInspection(propertyId, notes, photos, (done, total) =>
        setUploadProgress({ done, total })
      );
      Alert.alert('Success', 'Inspection created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create inspection';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (isCheckingLimits) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={th.semantic.primary} />
        <Text style={styles.loadingText}>Checking limits...</Text>
      </View>
    );
  }

  // Camera view
  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraTopBar}>
              <TouchableOpacity
                style={styles.cameraCloseButton}
                onPress={() => setIsCameraActive(false)}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              {activeRoom && <Text style={styles.cameraRoomLabel}>{activeRoom.label}</Text>}
            </View>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Room category picker
  if (showRoomPicker) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowRoomPicker(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={th.semantic.fg} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add a Room</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.pickerHint}>
            Pick a room type (auto-numbered) — or add a custom room. {rooms.length}/{MAX_ROOMS_PER_INSPECTION} rooms.
          </Text>
          {ROOM_TYPES.map((category) => {
            const existing = rooms.filter((r) => r.room_type === category.value).length;
            return (
              <TouchableOpacity
                key={category.value}
                style={styles.roomPickerRow}
                onPress={() => addRoom(category)}
              >
                <Text style={styles.roomPickerLabel}>
                  {category.label} {existing + 1}
                </Text>
                <Ionicons name="add-circle-outline" size={22} color={th.semantic.primary} />
              </TouchableOpacity>
            );
          })}

          <Text style={styles.customRoomLabel}>Custom room</Text>
          <View style={styles.customRoomRow}>
            <TextInput
              style={[styles.input, styles.customRoomInput]}
              placeholder="e.g. Garage, Balcony, Hallway"
              placeholderTextColor={th.semantic.fgSubtle}
              value={customRoomName}
              onChangeText={setCustomRoomName}
              maxLength={MAX_ROOM_NAME_LENGTH}
              onSubmitEditing={addCustomRoom}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.customRoomAdd, !customRoomName.trim() && styles.customRoomAddDisabled]}
              onPress={addCustomRoom}
              disabled={!customRoomName.trim()}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Photo detail (caption + delete)
  if (selectedPhoto) {
    const room = rooms.find((r) => r.id === selectedPhoto.roomId);
    const photo = room?.photos[selectedPhoto.index];
    if (room && photo) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedPhoto(null)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={th.semantic.fg} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{room.label}</Text>
            <TouchableOpacity
              onPress={() => removePhoto(selectedPhoto.roomId, selectedPhoto.index)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={22} color={th.semantic.danger} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content}>
            <Image source={{ uri: photo.uri }} style={styles.photoPreviewLarge} />
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Caption</Text>
              <TextInput
                style={styles.input}
                placeholder="Add a caption for this photo..."
                placeholderTextColor={th.semantic.fgSubtle}
                value={photo.caption}
                onChangeText={(text) => updatePhotoCaption(selectedPhoto.roomId, selectedPhoto.index, text)}
              />
            </View>
            <TouchableOpacity style={styles.doneButton} onPress={() => setSelectedPhoto(null)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={th.semantic.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Inspection</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Rooms</Text>
            <Text style={styles.totalCount}>{totalPhotos}/{maxTotalPhotos} photos</Text>
          </View>

          {rooms.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={32} color={th.semantic.fgSubtle} />
              <Text style={styles.emptyStateText}>
                Add a room to start documenting this inspection.
              </Text>
            </View>
          )}

          {rooms.map((room) => {
            const roomFull = room.photos.length >= MAX_PHOTOS_PER_ROOM;
            return (
              <View key={room.id} style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomTitle}>{room.label}</Text>
                  <View style={styles.roomHeaderRight}>
                    <Text style={styles.roomCount}>
                      {room.photos.length}/{MAX_PHOTOS_PER_ROOM}
                    </Text>
                    <TouchableOpacity onPress={() => removeRoom(room.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={th.semantic.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                {room.photos.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photoList}
                  >
                    {room.photos.map((photo, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.photoThumbnail}
                        onPress={() => setSelectedPhoto({ roomId: room.id, index })}
                      >
                        <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {roomFull ? (
                  <Text style={styles.roomFullText}>Room full ({MAX_PHOTOS_PER_ROOM} photos)</Text>
                ) : (
                  <View style={styles.roomActions}>
                    <TouchableOpacity
                      style={[styles.roomActionButton, isAddingPhotos && styles.submitButtonDisabled]}
                      onPress={() => handleOpenCamera(room.id)}
                      disabled={isAddingPhotos}
                    >
                      <Ionicons name="camera-outline" size={20} color={th.semantic.primary} />
                      <Text style={styles.roomActionText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roomActionButton, isAddingPhotos && styles.submitButtonDisabled]}
                      onPress={() => handlePickImage(room.id)}
                      disabled={isAddingPhotos}
                    >
                      <Ionicons name="images-outline" size={20} color={th.semantic.primary} />
                      <Text style={styles.roomActionText}>Library</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity style={styles.addRoomButton} onPress={() => setShowRoomPicker(true)}>
            <Ionicons name="add" size={20} color={th.semantic.primary} />
            <Text style={styles.addRoomText}>Add room</Text>
          </TouchableOpacity>

          {isAddingPhotos && (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color={th.semantic.primary} />
              <Text style={styles.processingText}>Processing photos…</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any general notes about this inspection..."
            placeholderTextColor={th.semantic.fgSubtle}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || isAddingPhotos || totalPhotos === 0) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || isAddingPhotos || totalPhotos === 0}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              {uploadProgress && uploadProgress.total > 0 && (
                <Text style={styles.submitButtonText}>
                  Uploading {uploadProgress.done}/{uploadProgress.total}…
                </Text>
              )}
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                Create Inspection ({totalPhotos} {totalPhotos === 1 ? 'photo' : 'photos'})
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (th: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: th.semantic.card,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: th.semantic.card,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: th.semantic.fgMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
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
  headerRight: {
    width: 40,
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
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: th.semantic.fg,
    marginBottom: 12,
  },
  totalCount: {
    fontSize: 13,
    fontWeight: '500',
    color: th.semantic.fgMuted,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: th.semantic.fgMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  roomCard: {
    borderWidth: 1,
    borderColor: th.semantic.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: th.semantic.cardMuted,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: th.semantic.fg,
  },
  roomHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomCount: {
    fontSize: 13,
    fontWeight: '500',
    color: th.semantic.fgMuted,
  },
  photoList: {
    gap: 10,
    paddingBottom: 12,
  },
  photoThumbnail: {
    width: 88,
    height: 88,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  roomActions: {
    flexDirection: 'row',
    gap: 10,
  },
  roomActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: th.semantic.primary,
    borderRadius: 8,
    gap: 6,
    borderStyle: 'dashed',
  },
  roomActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: th.semantic.primary,
  },
  roomFullText: {
    fontSize: 13,
    color: th.semantic.fgSubtle,
    textAlign: 'center',
    paddingVertical: 8,
  },
  addRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: th.semantic.primary,
    borderRadius: 8,
    gap: 8,
  },
  addRoomText: {
    fontSize: 14,
    fontWeight: '600',
    color: th.semantic.primary,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  processingText: {
    fontSize: 14,
    color: th.semantic.fgMuted,
  },
  pickerHint: {
    fontSize: 14,
    color: th.semantic.fgMuted,
    marginBottom: 16,
  },
  roomPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: th.semantic.line,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: th.semantic.cardMuted,
  },
  roomPickerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: th.semantic.fg,
  },
  customRoomLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: th.semantic.fg,
    marginTop: 12,
    marginBottom: 8,
  },
  customRoomRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  customRoomInput: {
    flex: 1,
  },
  customRoomAdd: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: th.semantic.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customRoomAddDisabled: {
    opacity: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: th.semantic.fg,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: th.semantic.lineStrong,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: th.semantic.cardMuted,
    color: th.semantic.fg,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  photoPreviewLarge: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: th.semantic.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: th.semantic.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  cameraTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cameraRoomLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: th.semantic.card,
  },
});
