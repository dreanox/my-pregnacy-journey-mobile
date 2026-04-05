import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { colors } from '@/lib/theme';

export default function ProfileLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pregnancies" options={{ title: t('profile.myPregnancies') }} />
      <Stack.Screen name="pregnancy/[pregnancyId]" options={{ title: t('profile.pregnancyArchiveTitle') }} />
      <Stack.Screen name="suggestions" options={{ title: t('profile.suggestions') }} />
      <Stack.Screen name="complaints" options={{ title: t('profile.complaints') }} />
      <Stack.Screen name="settings" options={{ title: t('profile.settings') }} />
      <Stack.Screen name="about" options={{ title: t('profile.about') }} />
    </Stack>
  );
}
