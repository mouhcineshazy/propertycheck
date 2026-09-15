/**
 * AddPropertySheet
 *
 * Shown when a free user has used their one free property and taps "add property."
 * Transaction-first: lead with a per-property Moving Bundle ($24.99) for the new
 * place, with the subscription as the secondary "managing several places" path.
 * Replaces the old subscription-only wall at this gate.
 */
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PAY_PER_USE, PRICING } from '@propertycheck/shared';
import { useI18n } from '../contexts';
import { useTheme, useThemedStyles, type AppTheme } from '../lib/theme';

interface AddPropertySheetProps {
  visible: boolean;
  onBundle: () => void;
  onSubscribe: () => void;
  onClose: () => void;
}

export function AddPropertySheet({ visible, onBundle, onSubscribe, onClose }: AddPropertySheetProps) {
  const th = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>{t('properties.addSheet.title')}</Text>
          <Text style={styles.subtitle}>{t('properties.addSheet.subtitle')}</Text>

          <TouchableOpacity style={[styles.option, styles.optionPrimary]} onPress={onBundle}>
            <View style={styles.optionIcon}>
              <Ionicons name="albums-outline" size={22} color={th.semantic.primary} />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>{t('properties.addSheet.bundleTitle')}</Text>
              <Text style={styles.optionDesc}>{t('properties.addSheet.bundleDesc')}</Text>
            </View>
            <Text style={styles.optionPrice}>{PAY_PER_USE.bundle.displayPrice}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onSubscribe}>
            <View style={styles.optionIcon}>
              <Ionicons name="star-outline" size={22} color={th.semantic.primary} />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>{t('properties.addSheet.subscribeTitle')}</Text>
              <Text style={styles.optionDesc}>{t('properties.addSheet.subscribeDesc')}</Text>
            </View>
            <Text style={styles.optionPrice}>{PRICING.annual.displayPrice}{t('properties.addSheet.perMonth')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
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
    optionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: th.semantic.fg,
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
