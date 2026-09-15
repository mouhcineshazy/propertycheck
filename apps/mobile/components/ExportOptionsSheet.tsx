/**
 * ExportOptionsSheet
 *
 * Bottom sheet shown when a non-entitled user exports an inspection PDF. It leads
 * with the Moving Bundle (the value anchor — two single reports cost more than
 * the bundle, which also includes the comparison), then the single-report unlock,
 * then a free watermarked copy. A native Alert can't do this cross-platform
 * (Android caps at 3 buttons), hence a custom sheet.
 */
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PAY_PER_USE } from '@propertycheck/shared';
import { useI18n } from '../contexts';
import { useTheme, useThemedStyles, type AppTheme } from '../lib/theme';

interface ExportOptionsSheetProps {
  visible: boolean;
  busy?: boolean;
  onBundle: () => void;
  onSingle: () => void;
  onFree: () => void;
  onClose: () => void;
}

export function ExportOptionsSheet({
  visible,
  busy = false,
  onBundle,
  onSingle,
  onFree,
  onClose,
}: ExportOptionsSheetProps) {
  const th = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>{t('inspection.detail.exportTitle')}</Text>
          <Text style={styles.subtitle}>{t('inspection.detail.exportSheetSubtitle')}</Text>

          {busy ? (
            <View style={styles.busyRow}>
              <ActivityIndicator color={th.semantic.primary} />
            </View>
          ) : (
            <>
              <TouchableOpacity style={[styles.option, styles.optionPrimary]} onPress={onBundle}>
                <View style={styles.optionIcon}>
                  <Ionicons name="albums-outline" size={22} color={th.semantic.primary} />
                </View>
                <View style={styles.optionBody}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionTitle}>{t('inspection.detail.exportBundleTitle')}</Text>
                    <Text style={styles.bestValue}>{t('inspection.detail.exportBestValue')}</Text>
                  </View>
                  <Text style={styles.optionDesc}>{t('inspection.detail.exportBundleDesc')}</Text>
                </View>
                <Text style={styles.optionPrice}>{PAY_PER_USE.bundle.displayPrice}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={onSingle}>
                <View style={styles.optionIcon}>
                  <Ionicons name="document-text-outline" size={22} color={th.semantic.primary} />
                </View>
                <View style={styles.optionBody}>
                  <Text style={styles.optionTitle}>{t('inspection.detail.exportSingleTitle')}</Text>
                  <Text style={styles.optionDesc}>{t('inspection.detail.exportSingleDesc')}</Text>
                </View>
                <Text style={styles.optionPrice}>{PAY_PER_USE.report.displayPrice}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={onFree}>
                <View style={styles.optionIcon}>
                  <Ionicons name="pricetag-outline" size={22} color={th.semantic.fgMuted} />
                </View>
                <View style={styles.optionBody}>
                  <Text style={styles.optionTitle}>{t('inspection.detail.exportFreeTitle')}</Text>
                  <Text style={styles.optionDesc}>{t('inspection.detail.exportFreeDesc')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (th: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: th.semantic.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: th.semantic.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: th.semantic.line,
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: th.semantic.fg,
    },
    subtitle: {
      fontSize: 14,
      color: th.semantic.fgMuted,
      marginTop: 4,
      marginBottom: 20,
    },
    busyRow: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: th.semantic.line,
      marginBottom: 10,
    },
    optionPrimary: {
      borderColor: th.semantic.primary,
      backgroundColor: th.semantic.primarySoft,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: th.semantic.cardMuted,
    },
    optionBody: {
      flex: 1,
    },
    optionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: th.semantic.fg,
    },
    bestValue: {
      fontSize: 11,
      fontWeight: '700',
      color: th.semantic.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    optionDesc: {
      fontSize: 13,
      color: th.semantic.fgMuted,
      marginTop: 2,
    },
    optionPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: th.semantic.fg,
    },
    cancelButton: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 4,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: th.semantic.fgMuted,
    },
  });
