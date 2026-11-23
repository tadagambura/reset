import { Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Intro } from '@/kit/Intro';
import { prefsStore } from '@/kit/prefs';
import { KitRoot } from '@/kit/Root';
import { useTheme } from '@/kit/theme';
import { brand } from '@/brand';

SplashScreen.preventAutoHideAsync().catch(() => {});
const usePrefs = prefsStore('reset', 20);
const Art = ({ children }: { children: string }) => <Text style={{ fontSize: 88 }}>{children}</Text>;

function Shell() {
  const { c } = useTheme();
  const onboarded = usePrefs((s) => s.onboarded);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      {!onboarded ? (
        <View style={StyleSheet.absoluteFill}>
          <Intro
            cta="Set up our home"
            onDone={() => usePrefs.getState().setOnboarded()}
            steps={[
              { title: 'Share the load', body: "Chores, routines and a fairness view of who's carrying what. No nagging, just a clear picture.", art: <Art>🧺</Art> },
              { title: 'Nothing sneaks up', body: 'MOT, insurance, TV licence, passports and bin day, all in one calendar with reminders.', art: <Art>🗓️</Art> },
              { title: 'Check in', body: "A 20-second check-in: mood, energy and social battery. Private unless you choose to share it with your household.", art: <Art>🧘</Art> },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Outfit_700Bold });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <KitRoot brand={brand}>
      <Shell />
    </KitRoot>
  );
}
