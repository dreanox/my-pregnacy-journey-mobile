import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useActivePregnancy } from '@/hooks/useActivePregnancy';
import { queryKeys } from '@/lib/queryKeys';
import {
  createPregnancy as createPregnancyApi,
  createWeekEntryForPregnancy,
  fetchWeekEntriesByPregnancy,
  type CreatePregnancyPayload,
} from '@/lib/services/weekEntry';
import type { Pregnancy, WeekEntry } from '@/lib/types';

export type UseTimelineOptions = {
  onCreateWeekEntryError?: () => void;
  onCreatePregnancySuccess?: () => void;
};

export function useTimeline(options?: UseTimelineOptions) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const router = useRouter();

  const pregnancyQuery = useActivePregnancy();
  const pregnancies = pregnancyQuery.data;
  const loadingPregs = pregnancyQuery.isPending;
  const activePregnancy = pregnancies?.find((p: Pregnancy) => p.is_active);

  const weekEntriesQuery = useQuery({
    queryKey: activePregnancy
      ? queryKeys.weekEntries.byPregnancy(activePregnancy.id)
      : queryKeys.weekEntries.all,
    queryFn: () => fetchWeekEntriesByPregnancy(activePregnancy!.id),
    enabled: !!activePregnancy,
  });

  const createPregnancyMutation = useMutation({
    mutationFn: (payload: CreatePregnancyPayload) => createPregnancyApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pregnancies.all });
      options?.onCreatePregnancySuccess?.();
    },
    onError: () => Alert.alert(t('common.error'), t('timeline.couldNotCreate')),
  });

  const createWeekEntryMutation = useMutation({
    mutationFn: ({ pregnancyId, weekNumber }: { pregnancyId: number; weekNumber: number }) =>
      createWeekEntryForPregnancy(pregnancyId, weekNumber),
    onSuccess: (entry: WeekEntry) => {
      qc.invalidateQueries({ queryKey: queryKeys.weekEntries.all });
      router.push(`/week/${entry.id}`);
    },
    onError: () => {
      options?.onCreateWeekEntryError?.();
      Alert.alert(t('common.error'), t('timeline.couldNotOpenWeek'));
    },
  });

  return {
    pregnancies,
    loadingPregs,
    activePregnancy,
    weekEntries: weekEntriesQuery.data,
    loadingEntries: weekEntriesQuery.isPending,
    createPregnancy: createPregnancyMutation,
    createWeekEntry: createWeekEntryMutation,
  };
}
