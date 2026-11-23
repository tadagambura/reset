import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import { useTheme } from '@/kit/theme';

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="chores" options={{ title: 'Chores', tabBarIcon: ({ color, size }) => <Ionicons name="checkbox-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="bank" options={{ title: 'Bank', tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color as string} size={size} /> }} />
    </Tabs>
  );
}
