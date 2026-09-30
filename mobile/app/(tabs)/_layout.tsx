import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme';

export default function TabLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.ink,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
        headerStyle: { backgroundColor: t.bg },
        headerShadowVisible: false,
        headerTintColor: t.ink,
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Kard', headerTitle: 'kard', tabBarLabel: 'Deals', tabBarIcon: ({ color }) => <FontAwesome name="credit-card" size={22} color={color} /> }} />
      <Tabs.Screen name="wallet" options={{ title: 'My cards', tabBarIcon: ({ color }) => <FontAwesome name="id-card" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <FontAwesome name="user-circle" size={22} color={color} /> }} />
    </Tabs>
  );
}
