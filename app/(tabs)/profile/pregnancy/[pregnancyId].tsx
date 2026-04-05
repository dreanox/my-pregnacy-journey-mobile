import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { parseCalendarDateFromApi } from '@/lib/date/apiDates';

import {
  TIMELINE_FLATLIST_INITIAL_NUM_RENDER,
  TIMELINE_FLATLIST_WINDOW_SIZE,
  TIMELINE_WEEK_COUNT,
} from '@/lib/constants/timeline';
import { showError } from '@/lib/errorHelper';
import { formatGestationalWeekRange, getGestationalWeekRange } from '@/lib/gestationalWeek';
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchPregnancies,
  fetchWeekEntriesByPregnancy,
  updatePregnancy,
} from '@/lib/services/weekEntry';
import { colors } from '@/lib/theme';

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default function ProfilePregnancyArchiveScreen() {
  const { pregnancyId: rawId } = useLocalSearchParams<{ pregnancyId: string | string[] }>();
  const pregnancyIdParam = firstParam(rawId);
  const pregnancyIdNum = pregnancyIdParam ? Number(pregnancyIdParam) : NaN;
  const validId = Number.isFinite(pregnancyIdNum) && pregnancyIdNum > 0;

  const { t, i18n } = useTranslation();
  const router = useRouter();
  const qc = useQueryClient();

  const pregnanciesQuery = useQuery({
    queryKey: queryKeys.pregnancies.all,
    queryFn: fetchPregnancies,
    enabled: validId,
  });

  const pregnancy = pregnanciesQuery.data?.find((p) => p.id === pregnancyIdNum);

  const weekEntriesQuery = useQuery({
    queryKey: queryKeys.weekEntries.byPregnancy(pregnancyIdNum),
    queryFn: () => fetchWeekEntriesByPregnancy(pregnancyIdNum),
    enabled: validId,
  });

  const reactivate = useMutation({
    mutationFn: () => updatePregnancy(pregnancyIdNum, { is_active: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pregnancies.all });
      qc.invalidateQueries({ queryKey: queryKeys.weekEntries.all });
      qc.invalidateQueries({ queryKey: queryKeys.appointments.upcoming });
      router.replace('/');
    },
    onError: (e) => showError(t('common.error'), e, t('profile.reactivatePregnancyFailed')),
  });

  const confirmReactivate = () => {
    if (reactivate.isPending) return;
    Alert.alert(t('profile.reactivatePregnancyConfirmTitle'), t('profile.reactivatePregnancyConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.reactivatePregnancyConfirmButton'),
        onPress: () => reactivate.mutate(),
      },
    ]);
  };

  const allWeeks = Array.from({ length: TIMELINE_WEEK_COUNT }, (_, i) => i + 1);
  const entryMap = new Map((weekEntriesQuery.data ?? []).map((e) => [e.week_number, e]));

  const handleWeekPress = (weekNum: number) => {
    const existing = entryMap.get(weekNum);
    if (!existing) return;
    router.push({
      pathname: '/week/[id]',
      params: { id: String(existing.id), pregnancyId: String(pregnancyIdNum) },
    });
  };

  if (!validId) {
    return (
      <View className="flex-1 justify-center items-center bg-surface p-8">
        <Text className="text-[16px] text-text-secondary text-center">{t('common.error')}</Text>
      </View>
    );
  }

  if (pregnanciesQuery.isPending || !pregnancy) {
    return (
      <View className="flex-1 justify-center items-center bg-surface p-8">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const subtitle = pregnancy.last_period_date
    ? t('profile.archiveLmpLine', {
        date:
          parseCalendarDateFromApi(pregnancy.last_period_date)?.format('DD/MM/YYYY') ??
          pregnancy.last_period_date.slice(0, 10),
      })
    : pregnancy.due_date
      ? t('timeline.dueDate', {
          date:
            parseCalendarDateFromApi(pregnancy.due_date)?.format('DD/MM/YYYY') ??
            pregnancy.due_date.slice(0, 10),
        })
      : null;

  const weeksWithData = weekEntriesQuery.data?.length ?? 0;

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-primary-soft border-b border-border px-4 py-3">
        <Text className="text-[15px] font-semibold text-text-primary">{subtitle}</Text>
        <Text className="text-[13px] text-text-muted mt-1">
          {t('profile.weeksWithData', { count: weeksWithData })}
        </Text>
        {!pregnancy.is_active ? (
          <Pressable
            onPress={confirmReactivate}
            disabled={reactivate.isPending}
            className={`mt-3 bg-primary rounded-[12px] py-3 items-center ${reactivate.isPending ? 'opacity-70' : ''}`}
          >
            {reactivate.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="text-white text-[15px] font-semibold">{t('profile.reactivatePregnancy')}</Text>
            )}
          </Pressable>
        ) : null}
      </View>

      {weekEntriesQuery.isPending ? (
        <ActivityIndicator className="mt-8" size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={allWeeks}
          keyExtractor={(item) => item.toString()}
          contentContainerClassName="p-4 pb-8"
          initialNumToRender={TIMELINE_FLATLIST_INITIAL_NUM_RENDER}
          windowSize={TIMELINE_FLATLIST_WINDOW_SIZE}
          renderItem={({ item: weekNum }) => {
            const entry = entryMap.get(weekNum);
            const hasData = !!entry;
            const weekRange = getGestationalWeekRange(weekNum, pregnancy);
            const weekRangeLabel = weekRange
              ? formatGestationalWeekRange(weekRange.start, weekRange.end, i18n.language)
              : null;

            return (
              <Pressable
                className={`flex-row items-center justify-between bg-card rounded-[14px] p-[14px] mb-2 border border-border ${hasData ? 'bg-card-alt' : 'opacity-60'}`}
                onPress={() => handleWeekPress(weekNum)}
                disabled={!hasData}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-surface-muted justify-center items-center mr-3">
                    <Text className="text-[15px] font-semibold text-text-secondary">{weekNum}</Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-[16px] font-semibold text-text-primary">
                      {t('timeline.week', { number: weekNum })}
                    </Text>
                    {weekRangeLabel ? (
                      <Text className="text-[12px] text-text-muted mt-0.5" numberOfLines={1}>
                        <FontAwesome name="calendar-o" size={11} color={colors.iconMuted} /> {weekRangeLabel}
                      </Text>
                    ) : null}
                    {entry ? (
                      <View className="flex-row flex-wrap mt-1 gap-x-3 gap-y-1">
                        {entry.weight ? (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="balance-scale" size={11} /> {entry.weight} {t('common.kg')}
                          </Text>
                        ) : null}
                        {(entry.symptoms?.length ?? 0) > 0 ? (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="heartbeat" size={11} /> {entry.symptoms!.length}
                          </Text>
                        ) : null}
                        {(entry.photos?.length ?? 0) > 0 ? (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="camera" size={11} /> {entry.photos!.length}
                          </Text>
                        ) : null}
                        {(entry.notes?.length ?? 0) > 0 ? (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="book" size={11} /> {entry.notes!.length}
                          </Text>
                        ) : null}
                        {(entry.appointments?.length ?? 0) > 0 ? (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="calendar-check-o" size={11} /> {entry.appointments!.length}
                          </Text>
                        ) : null}
                      </View>
                    ) : (
                      <Text className="text-[12px] text-text-muted mt-1">{t('profile.archiveWeekEmpty')}</Text>
                    )}
                  </View>
                </View>
                {hasData ? (
                  <FontAwesome name="chevron-right" size={14} color={colors.iconMuted} />
                ) : null}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
