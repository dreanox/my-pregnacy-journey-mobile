import { Stack, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AppointmentsSection,
  MedicationsSection,
  NotesSection,
  PhotosSection,
  SymptomsSection,
  WeightSection,
} from '@/components/week';
import { useWeekEntry } from '@/hooks/useWeekEntry';
import { colors } from '@/lib/theme';

export default function WeekDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: entry, isLoading, isError, pregnancyId, noActivePregnancy } = useWeekEntry(id);

  if (noActivePregnancy) {
    return (
      <View className="flex-1 justify-center items-center bg-surface p-8">
        <Text className="text-[16px] text-text-secondary text-center">{t('timeline.startJourney')}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !entry || pregnancyId == null) {
    return (
      <View className="flex-1 justify-center items-center bg-surface p-8">
        <Text className="text-[16px] text-text-secondary text-center">{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('week.title', { number: entry.week_number }),
          headerBackTitleVisible: false,
        } as { title: string; headerBackTitleVisible: boolean }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerClassName="p-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <WeightSection entry={entry} weekEntryRouteId={id} pregnancyId={pregnancyId} />
          <NotesSection entry={entry} weekEntryRouteId={id} />
          <SymptomsSection entry={entry} weekEntryRouteId={id} />
          <MedicationsSection entry={entry} weekEntryRouteId={id} />
          <PhotosSection entry={entry} weekEntryRouteId={id} />
          <AppointmentsSection entry={entry} weekEntryRouteId={id} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
