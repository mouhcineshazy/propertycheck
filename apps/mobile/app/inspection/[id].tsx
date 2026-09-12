/**
 * Inspection Detail Screen - React 19 Pattern
 *
 * Features:
 * - View inspection with all photos
 * - Generate and share PDF report
 * - Mark as complete
 * - Delete inspection
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Href, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getMobileSupabaseClient } from '../../lib/supabase';
import {
  fetchInspectionWithPhotos,
  completeInspection,
  deleteInspection,
  generateInspectionPdf,
  getPhotoUrl,
  canGenerateComparison,
  sendReportByEmail,
  createReportUnlockCheckout,
} from '../../lib';
import type { InspectionWithPhotos, PDFOptions } from '../../lib';
import { useI18n } from '../../contexts';
import { useTheme, useThemedStyles, type AppTheme } from '../../lib/theme';

// Photo thumbnail with loading/error states
function PhotoThumbnail({
  storagePath,
  onPress,
  roomType,
  roomLabel,
  errorText,
}: {
  storagePath: string;
  onPress: () => void;
  roomType: string;
  roomLabel: string;
  errorText: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const photoUrl = getPhotoUrl(storagePath);
  const th = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity style={styles.photoThumbnail} onPress={onPress}>
      {isLoading && (
        <View style={styles.photoPlaceholder}>
          <ActivityIndicator size="small" color={th.semantic.primary} />
        </View>
      )}
      {hasError && (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="image-outline" size={24} color={th.semantic.fgSubtle} />
          <Text style={styles.photoErrorText}>{errorText}</Text>
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
          {roomLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function InspectionDetailScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const th = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();

  // Room type labels with translations
  const getRoomLabel = (roomType: string) => {
    const labels: Record<string, string> = {
      living_room: t('inspection.new.rooms.livingRoom'),
      bedroom: t('inspection.new.rooms.bedroom'),
      bathroom: t('inspection.new.rooms.bathroom'),
      kitchen: t('inspection.new.rooms.kitchen'),
      other: t('inspection.new.rooms.other'),
    };
    return labels[roomType] || labels.other;
  };

  const [inspection, setInspection] = useState<InspectionWithPhotos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailFieldError, setEmailFieldError] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isFirstInspection, setIsFirstInspection] = useState(true);
  const [isPurchasingReport, setIsPurchasingReport] = useState(false);

  // Refetch data when screen gains focus (after completing/editing inspection elsewhere)
  useFocusEffect(
    useCallback(() => {
      async function loadInspection() {
        if (!id) return;

        try {
          const supabase = getMobileSupabaseClient();

          // Fetch inspection data
          const data = await fetchInspectionWithPhotos(id);
          setInspection(data);

          // Fetch subscription status and property inspections in parallel
          const propertyId = data.property?.id || data.property_id;
          const [subResult, inspectionsResult] = await Promise.all([
            supabase.from('subscriptions').select('status').single(),
            supabase
              .from('inspections')
              .select('id, created_at')
              .eq('property_id', propertyId)
              .order('created_at', { ascending: true }),
          ]);

          // Set premium status
          setIsPremium(subResult.data?.status === 'premium');

          // Determine if this is the first inspection (move-in) or not (move-out)
          if (inspectionsResult.data && inspectionsResult.data.length > 0) {
            const firstInspectionId = inspectionsResult.data[0].id;
            setIsFirstInspection(id === firstInspectionId);
          }
        } catch (err) {
          console.error('Error loading inspection:', err);
          Alert.alert(t('common.error'), t('inspection.detail.loadError'), [
            { text: t('common.ok'), onPress: () => router.back() },
          ]);
        } finally {
          setIsLoading(false);
        }
      }

      loadInspection();
    }, [id, router, t])
  );

  const handleComplete = async () => {
    if (!id || !inspection) return;

    Alert.alert(
      t('inspection.detail.completeTitle'),
      t('inspection.detail.completeMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('inspection.detail.completeButton'),
          onPress: async () => {
            setIsCompleting(true);
            try {
              await completeInspection(id);
              setInspection({ ...inspection, status: 'completed' });

              // Check if we can now generate a comparison report
              const propertyId = inspection.property?.id || inspection.property_id;
              const comparisonStatus = await canGenerateComparison(propertyId);

              if (comparisonStatus.canCompare) {
                // Show comparison prompt
                Alert.alert(
                  t('inspection.detail.comparisonReadyTitle'),
                  t('inspection.detail.comparisonReadyMessage'),
                  [
                    { text: t('upgrade.maybeLater'), style: 'cancel' },
                    {
                      text: t('inspection.detail.viewComparison'),
                      onPress: () => {
                        router.push(`/inspection/compare?propertyId=${propertyId}` as Href);
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(t('common.success'), t('inspection.detail.completedSuccess'));
              }
            } catch (err) {
              console.error('Error completing inspection:', err);
              Alert.alert(t('common.error'), t('inspection.detail.completeError'));
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
      t('inspection.detail.deleteConfirm.title'),
      t('inspection.detail.deleteConfirm.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('inspection.detail.deleteConfirm.confirmButton'),
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            setIsDeleting(true);
            try {
              await deleteInspection(id);
              Alert.alert(t('common.success'), t('inspection.detail.deletedSuccess'), [
                { text: t('common.ok'), onPress: () => router.back() },
              ]);
            } catch (err) {
              console.error('Error deleting inspection:', err);
              Alert.alert(t('common.error'), t('errors.generic'));
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
      const propertyAddress = inspection.property?.address || (t('inspection.detail.unknownProperty'));

      // Refresh share link expiry to 30 days so the QR code stays valid
      const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://propertycheck.app';
      let shareUrl: string | undefined;
      if (inspection.share_token) {
        const supabase = getMobileSupabaseClient();
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('inspections')
          .update({ share_expires_at: thirtyDaysFromNow })
          .eq('id', inspection.id);
        shareUrl = `${appUrl}/${locale}/share/${inspection.share_token}`;
      }

      const pdfOptions: PDFOptions = {
        isPremium: isPremium || !!inspection.report_unlocked,
        isFirstInspection,
        locale: locale as 'en' | 'fr',
        shareUrl,
      };
      const pdfUri = await generateInspectionPdf(inspection, propertyAddress, pdfOptions);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: t('inspection.detail.shareReport'),
        });
      } else {
        Alert.alert(t('common.success'), t('inspection.detail.pdfGenerated'));
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleEmailButtonPress = () => {
    setRecipientEmail('');
    setEmailFieldError('');
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!inspection || !id) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      setEmailFieldError(t('inspection.detail.invalidEmail'));
      return;
    }

    setShowEmailModal(false);
    setIsSendingEmail(true);
    try {
      const propertyAddress = inspection.property?.address || t('inspection.detail.unknownProperty');
      const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://propertycheck.app';
      const shareUrl = inspection.share_token
        ? `${appUrl}/${locale}/share/${inspection.share_token}`
        : undefined;
      // Email API route refreshes share_expires_at to 30 days server-side
      const pdfOptions: PDFOptions = {
        isPremium: isPremium || !!inspection.report_unlocked,
        isFirstInspection,
        locale: locale as 'en' | 'fr',
        shareUrl,
      };
      const pdfUri = await generateInspectionPdf(inspection, propertyAddress, pdfOptions);

      const { success, error } = await sendReportByEmail({
        inspectionId: id,
        recipientEmail: recipientEmail.trim(),
        pdfUri,
      });

      if (success) {
        Alert.alert(
          t('inspection.detail.reportSent'),
          t('inspection.detail.reportSentTo', { email: recipientEmail.trim() })
        );
      } else {
        console.error('Email send error:', error);
        Alert.alert(t('common.error'), t('inspection.detail.sendEmailError'));
      }
    } catch (err) {
      console.error('Error sending report email:', err);
      Alert.alert(t('common.error'), t('inspection.detail.sendEmailError'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePurchaseReport = async () => {
    if (!inspection || !id) return;
    setIsPurchasingReport(true);
    try {
      const { url, error } = await createReportUnlockCheckout(id);
      if (error || !url) {
        Alert.alert(t('common.error'), t('inspection.detail.purchaseFailed'));
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('inspection.detail.purchaseFailed'));
    } finally {
      setIsPurchasingReport(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={th.semantic.primary} />
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={th.semantic.danger} />
        <Text style={styles.errorText}>{t('errors.notFound')}</Text>
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
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Image
            source={{ uri: getPhotoUrl(photo.storage_path) }}
            style={styles.modalImage}
            resizeMode="contain"
          />

          <View style={styles.modalInfo}>
            <Text style={styles.modalRoomType}>
              {getRoomLabel(photo.room_type || 'other')}
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
                color={selectedPhotoIndex === 0 ? 'rgba(255,255,255,0.4)' : '#FFFFFF'}
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
                color={selectedPhotoIndex === photoCount - 1 ? 'rgba(255,255,255,0.4)' : '#FFFFFF'}
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
          <Ionicons name="arrow-back" size={24} color={th.semantic.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('inspection.detail.title')}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          {isDeleting ? (
            <ActivityIndicator size="small" color={th.semantic.danger} />
          ) : (
            <Ionicons name="trash-outline" size={22} color={th.semantic.danger} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.inspectionDate}>
                {format(
                  new Date(inspection.created_at),
                  locale === 'fr' ? 'd MMMM yyyy' : 'MMMM d, yyyy',
                  locale === 'fr' ? { locale: fr } : undefined
                )}
              </Text>
              <Text style={styles.inspectionTime}>
                {format(new Date(inspection.created_at), 'HH:mm')}
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
                {isCompleted ? t('inspection.status.completed') : t('inspection.status.inProgress')}
              </Text>
            </View>
          </View>

          {inspection.property && (
            <View style={styles.propertyInfo}>
              <Ionicons name="location-outline" size={16} color={th.semantic.fgMuted} />
              <Text style={styles.propertyAddress}>{inspection.property.address}</Text>
            </View>
          )}

          {inspection.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>{t('inspection.detail.notes')}</Text>
              <Text style={styles.notesText}>{inspection.notes}</Text>
            </View>
          )}
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('inspection.detail.photos', { count: photoCount })}</Text>

          {photoCount === 0 ? (
            <View style={styles.emptyPhotos}>
              <Ionicons name="images-outline" size={48} color={th.semantic.fgSubtle} />
              <Text style={styles.emptyText}>{t('inspection.detail.noPhotos')}</Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {inspection.photos?.map((photo, index) => (
                <PhotoThumbnail
                  key={photo.id}
                  storagePath={photo.storage_path}
                  roomType={photo.room_type || 'other'}
                  roomLabel={getRoomLabel(photo.room_type || 'other')}
                  errorText={t('inspection.detail.photoLoadError')}
                  onPress={() => setSelectedPhotoIndex(index)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Report Unlock Card — only for completed inspections */}
        {isCompleted && !isPremium && (
          <View style={styles.unlockCard}>
            {inspection.report_unlocked ? (
              <>
                <View style={styles.unlockIconRow}>
                  <Ionicons name="checkmark-circle" size={20} color={th.semantic.verified} />
                  <Text style={styles.unlockTitleGreen}>{t('inspection.detail.reportUnlocked')}</Text>
                </View>
                <Text style={styles.unlockDesc}>{t('inspection.detail.reportUnlockedDesc')}</Text>
              </>
            ) : (
              <>
                <View style={styles.unlockIconRow}>
                  <Ionicons name="lock-closed-outline" size={20} color={th.semantic.primary} />
                  <Text style={styles.unlockTitle}>{t('inspection.detail.unlockReport')}</Text>
                </View>
                <Text style={styles.unlockDesc}>{t('inspection.detail.unlockReportDesc')}</Text>
                <TouchableOpacity
                  style={[styles.unlockButton, isPurchasingReport && styles.buttonDisabled]}
                  onPress={handlePurchaseReport}
                  disabled={isPurchasingReport}
                >
                  {isPurchasingReport ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.unlockButtonText}>{t('inspection.detail.unlockReportButton')}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

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
              <ActivityIndicator color={th.semantic.verified} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color={th.semantic.verified} />
                <Text style={styles.completeButtonText}>{t('inspection.detail.completeButton')}</Text>
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
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
              <Text style={styles.pdfButtonText}>PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.emailButton, isSendingEmail && styles.buttonDisabled]}
          onPress={handleEmailButtonPress}
          disabled={isSendingEmail}
        >
          {isSendingEmail ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
              <Text style={styles.emailButtonText}>Email</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Email recipient modal */}
      <Modal
        visible={showEmailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.emailModal}>
            <Text style={styles.emailModalTitle}>{t('inspection.detail.sendToLandlordTitle')}</Text>
            <Text style={styles.emailModalSubtitle}>{t('inspection.detail.sendToLandlordSubtitle')}</Text>

            <TextInput
              style={[styles.emailInput, emailFieldError ? styles.emailInputError : null]}
              placeholder={t('inspection.detail.landlordEmailPlaceholder')}
              placeholderTextColor={th.semantic.fgSubtle}
              value={recipientEmail}
              onChangeText={(text) => {
                setRecipientEmail(text);
                if (emailFieldError) setEmailFieldError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            {emailFieldError ? (
              <Text style={styles.emailInputErrorText}>{emailFieldError}</Text>
            ) : null}

            <View style={styles.emailModalActions}>
              <TouchableOpacity
                style={styles.emailModalCancel}
                onPress={() => setShowEmailModal(false)}
              >
                <Text style={styles.emailModalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emailModalSend}
                onPress={handleSendEmail}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.emailModalSendText}>{t('inspection.detail.sendButton')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
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
    backgroundColor: th.semantic.card,
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
    color: th.semantic.fg,
  },
  inspectionTime: {
    fontSize: 14,
    color: th.semantic.fgMuted,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: th.semantic.warningSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeCompleted: {
    backgroundColor: th.semantic.verifiedSoft,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: th.semantic.warning,
  },
  statusBadgeTextCompleted: {
    color: th.semantic.verified,
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: th.semantic.line,
    gap: 6,
  },
  propertyAddress: {
    flex: 1,
    fontSize: 14,
    color: th.semantic.fgMuted,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: th.semantic.line,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: th.semantic.fgMuted,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: th.semantic.fg,
    lineHeight: 20,
  },
  section: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: th.semantic.fg,
    marginBottom: 12,
  },
  emptyPhotos: {
    backgroundColor: th.semantic.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: th.semantic.fgMuted,
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
    backgroundColor: th.semantic.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoErrorText: {
    fontSize: 10,
    color: th.semantic.fgSubtle,
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
    color: th.semantic.fgMuted,
    marginTop: 12,
  },
  bottomPadding: {
    height: 40,
  },
  unlockCard: {
    backgroundColor: th.semantic.primarySoft,
    borderWidth: 1,
    borderColor: th.semantic.line,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unlockIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  unlockTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: th.semantic.primary,
  },
  unlockTitleGreen: {
    fontSize: 15,
    fontWeight: '600',
    color: th.semantic.verified,
  },
  unlockDesc: {
    fontSize: 13,
    color: th.semantic.fgMuted,
    marginBottom: 12,
  },
  unlockButton: {
    backgroundColor: th.semantic.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: th.semantic.card,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: th.semantic.line,
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
    backgroundColor: th.semantic.verifiedSoft,
    gap: 8,
  },
  completeButtonText: {
    color: th.semantic.verified,
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
    backgroundColor: th.semantic.primary,
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
    backgroundColor: th.semantic.verified,
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
    color: th.semantic.fgSubtle,
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
  // Email recipient modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emailModal: {
    backgroundColor: th.semantic.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  emailModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: th.semantic.fg,
    marginBottom: 8,
  },
  emailModalSubtitle: {
    fontSize: 14,
    color: th.semantic.fgMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  emailInput: {
    borderWidth: 1.5,
    borderColor: th.semantic.line,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: th.semantic.fg,
    backgroundColor: th.semantic.cardMuted,
  },
  emailInputError: {
    borderColor: th.semantic.danger,
  },
  emailInputErrorText: {
    fontSize: 13,
    color: th.semantic.danger,
    marginTop: 6,
  },
  emailModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  emailModalCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: th.semantic.canvas,
    alignItems: 'center',
  },
  emailModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: th.semantic.fgMuted,
  },
  emailModalSend: {
    flex: 2,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    backgroundColor: th.semantic.verified,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emailModalSendText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
