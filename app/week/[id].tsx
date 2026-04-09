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

import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import {
  AppointmentsSection,
  MedicationsSection,
  NotesSection,
  PhotosSection,
  SymptomsSection,
  WeightSection,
} from '@/components/week';
import { useActivePregnancyId } from '@/hooks/useActivePregnancy';
import { useWeekEntry } from '@/hooks/useWeekEntry';
import { colors } from '@/lib/theme';

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default function WeekDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[]; pregnancyId?: string | string[] }>();
  const id = firstParam(params.id);
  const pregnancyIdParam = firstParam(params.pregnancyId);
  const { t } = useTranslation();
  const { activePregnancy } = useActivePregnancyId();
  const { data: entry, isLoading, isError, pregnancyId, noActivePregnancy } = useWeekEntry(id, {
    pregnancyIdOverride: pregnancyIdParam,
  });

  const headerLoadingOptions = {
    title: '',
    headerBackTitle: '',
  } as const;

  if (!id) {
    return (
      <>
        <Stack.Screen options={headerLoadingOptions} />
        <View className="flex-1 justify-center items-center bg-surface p-8">
          <Text className="text-[16px] text-text-secondary text-center">{t('common.error')}</Text>
        </View>
      </>
    );
  }

  if (noActivePregnancy) {
    return (
      <>
        <Stack.Screen options={headerLoadingOptions} />
        <View className="flex-1 justify-center items-center bg-surface p-8">
          <Text className="text-[16px] text-text-secondary text-center">{t('timeline.startJourney')}</Text>
        </View>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={headerLoadingOptions} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (isError || !entry || pregnancyId == null || !id) {
    return (
      <>
        <Stack.Screen options={headerLoadingOptions} />
        <View className="flex-1 justify-center items-center bg-surface p-8">
          <Text className="text-[16px] text-text-secondary text-center">{t('common.error')}</Text>
        </View>
      </>
    );
  }

  const readOnly = activePregnancy == null || entry.pregnancy_id !== activePregnancy.id;

  return (
    <>
      <Stack.Screen
        options={{
          title: t('week.title', { number: entry.week_number }),
          headerBackTitle: '',
        }}
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
          {readOnly ? (
            <View className="bg-primary-soft border border-primary rounded-[12px] px-3 py-2.5 mb-3">
              <Text className="text-[13px] text-primary font-medium leading-5">{t('week.readOnlyArchiveHint')}</Text>
            </View>
          ) : null}
          <MedicalDisclaimer className="mb-3" />
          <WeightSection
            entry={entry}
            weekEntryRouteId={id}
            pregnancyId={pregnancyId}
            readOnly={readOnly}
          />
          <NotesSection entry={entry} weekEntryRouteId={id} readOnly={readOnly} />
          <SymptomsSection entry={entry} weekEntryRouteId={id} readOnly={readOnly} />
          <MedicationsSection entry={entry} weekEntryRouteId={id} readOnly={readOnly} />
          <PhotosSection entry={entry} weekEntryRouteId={id} readOnly={readOnly} />
          <AppointmentsSection entry={entry} weekEntryRouteId={id} readOnly={readOnly} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
