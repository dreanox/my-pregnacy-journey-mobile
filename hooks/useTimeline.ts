import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useActivePregnancy } from '@/hooks/useActivePregnancy';
import { getLiveCurrentWeek } from '@/lib/gestationalWeek';
import { queryKeys } from '@/lib/queryKeys';
import {
  createPregnancy as createPregnancyApi,
  createWeekEntryForPregnancy,
  fetchWeekEntriesByPregnancy,
  updatePregnancy,
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

  const syncStoredWeekMutation = useMutation({
    mutationFn: ({ id, week }: { id: number; week: number }) => updatePregnancy(id, { current_week: week }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pregnancies.all });
    },
  });

  const trySyncStoredGestationalWeek = useCallback(() => {
    if (!activePregnancy || syncStoredWeekMutation.isPending) return;
    const live = getLiveCurrentWeek(activePregnancy);
    if (live !== activePregnancy.current_week) {
      syncStoredWeekMutation.mutate({ id: activePregnancy.id, week: live });
    }
  }, [activePregnancy, syncStoredWeekMutation]);

  useEffect(() => {
    trySyncStoredGestationalWeek();
  }, [trySyncStoredGestationalWeek]);

  useFocusEffect(
    useCallback(() => {
      trySyncStoredGestationalWeek();
    }, [trySyncStoredGestationalWeek])
  );

  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && next === 'active') {
        trySyncStoredGestationalWeek();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [trySyncStoredGestationalWeek]);

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
