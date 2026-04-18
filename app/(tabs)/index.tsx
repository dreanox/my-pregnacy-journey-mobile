import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { useAuth } from '@/lib/auth';
import { showTimelineDateDebug } from '@/lib/featureFlags';
import { useTimeline } from '@/hooks/useTimeline';
import { useTimelineWeekListScroll } from '@/hooks/useTimelineWeekListScroll';
import {
  TIMELINE_FLATLIST_INITIAL_NUM_RENDER,
  TIMELINE_FLATLIST_WINDOW_SIZE,
  TIMELINE_WEEK_COUNT,
} from '@/lib/constants/timeline';
import { parseCalendarDateFromApi } from '@/lib/date/apiDates';
import {
  calcFromLMP,
  formatGestationalWeekRange,
  getGestationalWeekRange,
  getLiveCurrentWeek,
} from '@/lib/gestationalWeek';
import { colors } from '@/lib/theme';

export default function TimelineScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const defaultStyles = useDefaultStyles();
  const [showNewPregnancy, setShowNewPregnancy] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState<string | undefined>(undefined);
  const [openingWeek, setOpeningWeek] = useState<number | null>(null);
  const [timelineFocusNonce, setTimelineFocusNonce] = useState(0);
  const timelineFirstFocus = useRef(true);
  const {
    loadingPregs,
    activePregnancy,
    weekEntries,
    loadingEntries,
    createPregnancy,
    createWeekEntry,
  } = useTimeline({
    onCreateWeekEntryError: () => setOpeningWeek(null),
    onCreatePregnancySuccess: () => {
      setShowNewPregnancy(false);
      setLastPeriodDate(undefined);
    },
  });

  useFocusEffect(
    useCallback(() => {
      setOpeningWeek(null);
      if (timelineFirstFocus.current) {
        timelineFirstFocus.current = false;
      } else {
        setTimelineFocusNonce((n) => n + 1);
      }
    }, [])
  );

  const currentWeek = activePregnancy ? getLiveCurrentWeek(activePregnancy) : 1;
  const allWeeks = Array.from({ length: TIMELINE_WEEK_COUNT }, (_, i) => i + 1);
  const entryMap = new Map((weekEntries ?? []).map((e) => [e.week_number, e]));

  const { weekListRef, onScrollToWeekIndexFailed } = useTimelineWeekListScroll({
    activePregnancy,
    loadingEntries,
    currentWeek,
    weekListLength: allWeeks.length,
    focusAlignNonce: timelineFocusNonce,
  });

  const navigatingToWeek =
    openingWeek !== null || createWeekEntry.isPending;

  const handleWeekPress = (weekNum: number) => {
    if (navigatingToWeek || !activePregnancy) return;
    const existing = entryMap.get(weekNum);
    setOpeningWeek(weekNum);
    if (existing) {
      router.push(`/week/${existing.id}`);
    } else {
      createWeekEntry.mutate({ pregnancyId: activePregnancy.id, weekNumber: weekNum });
    }
  };

  if (loadingPregs) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-soft p-8">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!activePregnancy) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-soft p-8">
        <Text className="text-[80px] mb-4">🤰</Text>
        <Text className="text-[26px] font-bold text-text-primary mb-2">{t('timeline.startJourney')}</Text>
        <Text className="text-[16px] text-text-secondary mb-8">{t('timeline.trackMoments')}</Text>
        <Pressable className="bg-primary rounded-xl py-4 px-10 items-center w-full" onPress={() => setShowNewPregnancy(true)}>
          <Text className="text-white text-[17px] font-semibold">{t('timeline.beginTracking')}</Text>
        </Pressable>
        <MedicalDisclaimer variant="inline" className="mt-6 px-1" />

        <Modal visible={showNewPregnancy} transparent animationType="slide">
          <View className="flex-1 bg-overlay justify-end">
            <View className="bg-card rounded-t-3xl p-6 pb-10">
              <Text className="text-[22px] font-bold text-text-primary mb-1">{t('timeline.newPregnancy')}</Text>
              <Text className="text-[14px] text-text-secondary mb-2">{t('timeline.lastPeriodDate')}</Text>
              <MedicalDisclaimer className="mb-4" />
              <DateTimePicker
                mode="single"
                locale="es"
                date={lastPeriodDate}
                onChange={(params) => {
                  const iso = dayjs(params.date as string).format('YYYY-MM-DD');
                  if (__DEV__) console.log('[DatePicker onChange]', iso);
                  setLastPeriodDate(iso);
                }}
                styles={{
                  ...defaultStyles,
                  selected: { backgroundColor: colors.primary, borderRadius: 20 },
                  selected_label: { color: colors.white, fontWeight: '600' },
                  today: { borderWidth: 1, borderColor: colors.primary, borderRadius: 20 },
                  today_label: { color: colors.primary },
                  button_prev_image: { tintColor: colors.primary },
                  button_next_image: { tintColor: colors.primary },
                }}
              />
              {showTimelineDateDebug(user) && (
                <Text className="text-[11px] text-text-placeholder text-center mt-1">
                  Selected: {lastPeriodDate ?? 'none'}
                </Text>
              )}
              {lastPeriodDate && (
                <View className="bg-primary-soft rounded-xl p-3 mb-3 gap-1.5">
                  <Text className="text-[14px] text-text-primary">
                    <FontAwesome name="calendar-check-o" size={14} color={colors.primary} />{' '}
                    {t('timeline.calculatedDueDate', {
                      date: calcFromLMP(lastPeriodDate).dueDate.format('DD/MM/YYYY'),
                    })}
                  </Text>
                  <Text className="text-[14px] text-text-primary">
                    <FontAwesome name="heartbeat" size={14} color={colors.primary} />{' '}
                    {t('timeline.calculatedWeek', { number: calcFromLMP(lastPeriodDate).currentWeek })}
                  </Text>
                </View>
              )}
              <Pressable
                className={`bg-primary rounded-xl py-4 px-10 items-center w-full ${!lastPeriodDate ? 'opacity-50' : ''}`}
                onPress={() => {
                  if (!lastPeriodDate) return;
                  const { dueDate, currentWeek: cw } = calcFromLMP(lastPeriodDate);
                  createPregnancy.mutate({
                    last_period_date: lastPeriodDate,
                    due_date: dueDate.format('YYYY-MM-DD'),
                    current_week: cw,
                  });
                }}
                disabled={!lastPeriodDate}
              >
                <Text className="text-white text-[17px] font-semibold">{t('common.create')}</Text>
              </Pressable>
              <Pressable className="items-center mt-3" onPress={() => { setShowNewPregnancy(false); setLastPeriodDate(undefined); }}>
                <Text className="text-text-secondary text-[16px]">{t('common.cancel')}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const formattedDueDate = activePregnancy.due_date
    ? (parseCalendarDateFromApi(activePregnancy.due_date)?.format('DD/MM/YYYY') ??
        activePregnancy.due_date)
    : null;

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-primary pt-4 pb-5 px-5 rounded-b-3xl">
        <Text className="text-[28px] font-bold text-white">{t('timeline.week', { number: currentWeek })}</Text>
        {formattedDueDate && (
          <View
            className="mt-3 flex-row items-center gap-3 self-stretch rounded-2xl px-3.5 py-3"
            style={{
              backgroundColor: 'rgba(255,255,255,0.22)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.38)',
            }}
          >
            <FontAwesome name="calendar-check-o" size={22} color={colors.white} />
            <View className="flex-1 min-w-0">
              <Text className="text-[12px] font-semibold text-white-translucent uppercase tracking-wide">
                {t('timeline.dueDateLabel')}
              </Text>
              <Text className="text-[22px] font-bold text-white leading-tight mt-0.5">{formattedDueDate}</Text>
            </View>
          </View>
        )}
        <Pressable
          onPress={() => router.push('/profile/settings')}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          className="self-start mt-3 active:opacity-80"
        >
          <Text className="text-[13px] text-white font-semibold underline">
            {t('timeline.managePregnancy')}
          </Text>
        </Pressable>
      </View>

      {loadingEntries ? (
        <ActivityIndicator className="mt-8" size="large" color={colors.primary} />
      ) : (
        <FlatList
          testID="timeline-week-list"
          ref={weekListRef}
          data={allWeeks}
          keyExtractor={(item) => item.toString()}
          contentContainerClassName="p-4 pb-8"
          onScrollToIndexFailed={onScrollToWeekIndexFailed}
          initialNumToRender={TIMELINE_FLATLIST_INITIAL_NUM_RENDER}
          windowSize={TIMELINE_FLATLIST_WINDOW_SIZE}
          ListFooterComponent={<MedicalDisclaimer variant="inline" className="mt-2 px-1 pb-2" />}
          renderItem={({ item: weekNum }) => {
            const entry = entryMap.get(weekNum);
            const isCurrent = weekNum === currentWeek;
            const hasData = !!entry;
            const isOpeningThisWeek =
              openingWeek === weekNum ||
              (createWeekEntry.isPending &&
                createWeekEntry.variables?.weekNumber === weekNum);
            const weekRange = getGestationalWeekRange(weekNum, activePregnancy);
            const weekRangeLabel = weekRange
              ? formatGestationalWeekRange(weekRange.start, weekRange.end, i18n.language)
              : null;

            return (
              <Pressable
                className={`flex-row items-center justify-between bg-card rounded-[14px] p-[14px] mb-2 border border-border ${isCurrent ? 'border-primary border-2 bg-primary-soft' : ''} ${hasData ? 'bg-card-alt' : ''} ${navigatingToWeek && !isOpeningThisWeek ? 'opacity-50' : ''}`}
                onPress={() => handleWeekPress(weekNum)}
                disabled={navigatingToWeek}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-10 h-10 rounded-full bg-surface-muted justify-center items-center mr-3 ${isCurrent ? 'bg-primary' : ''}`}
                  >
                    <Text
                      className={`text-[15px] font-semibold text-text-secondary ${isCurrent ? 'text-white' : ''}`}
                    >
                      {weekNum}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-[16px] font-semibold text-text-primary ${isCurrent ? 'text-primary' : ''}`}>
                      {t('timeline.week', { number: weekNum })}
                    </Text>
                    {weekRangeLabel && (
                      <Text
                        className={`text-[12px] mt-0.5 ${isCurrent ? 'text-primary opacity-90' : 'text-text-muted'}`}
                        numberOfLines={1}
                      >
                        <FontAwesome name="calendar-o" size={11} color={isCurrent ? colors.primary : colors.iconMuted} />{' '}
                        {weekRangeLabel}
                      </Text>
                    )}
                    {entry && (
                      <View className="flex-row flex-wrap mt-1 gap-x-3 gap-y-1">
                        {entry.weight && (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="balance-scale" size={11} /> {entry.weight} {t('common.kg')}
                          </Text>
                        )}
                        {(entry.symptoms?.length ?? 0) > 0 && (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="heartbeat" size={11} /> {entry.symptoms!.length}
                          </Text>
                        )}
                        {(entry.photos?.length ?? 0) > 0 && (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="camera" size={11} /> {entry.photos!.length}
                          </Text>
                        )}
                        {(entry.notes?.length ?? 0) > 0 && (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="book" size={11} /> {entry.notes!.length}
                          </Text>
                        )}
                        {(entry.appointments?.length ?? 0) > 0 && (
                          <Text className="text-[12px] text-text-muted">
                            <FontAwesome name="calendar-check-o" size={11} /> {entry.appointments!.length}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
                {isOpeningThisWeek ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <FontAwesome name="chevron-right" size={14} color={colors.iconMuted} />
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
