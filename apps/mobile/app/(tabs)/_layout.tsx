/**
 * Tabs Layout
 *
 * Bottom tab navigation for authenticated users (Properties, Settings).
 * Colors come from the Trust Ink theme (lib/theme.ts).
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useI18n } from '../../contexts';
import { useTheme } from '../../lib/theme';

export default function TabsLayout() {
  const { t } = useI18n();
  const { semantic, colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: semantic.primary,
        tabBarInactiveTintColor: colors.ink[400],
        tabBarStyle: {
          backgroundColor: semantic.card,
          borderTopColor: semantic.line,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: semantic.card,
          borderBottomColor: semantic.line,
          borderBottomWidth: 1,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: semantic.fg,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.properties'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
