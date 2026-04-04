import { useCallback, useLayoutEffect, useRef } from 'react';
import { FlatList } from 'react-native';

import {
  TIMELINE_LIST_CONTENT_PADDING_TOP,
  TIMELINE_WEEK_ROW_ESTIMATED_LENGTH,
} from '@/lib/constants/timeline';
import type { Pregnancy } from '@/lib/types';

/**
 * Centers the current gestational week in the timeline FlatList once per active pregnancy load.
 */
export function useTimelineWeekListScroll(options: {
  activePregnancy: Pregnancy | undefined;
  loadingEntries: boolean;
  currentWeek: number;
  weekListLength: number;
}) {
  const { activePregnancy, loadingEntries, currentWeek, weekListLength } = options;
  const weekListRef = useRef<FlatList>(null);
  const didScrollToCurrentWeek = useRef(false);
  const lastPregnancyIdForScroll = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!activePregnancy || loadingEntries) return;
    if (lastPregnancyIdForScroll.current !== activePregnancy.id) {
      lastPregnancyIdForScroll.current = activePregnancy.id;
      didScrollToCurrentWeek.current = false;
    }
    if (didScrollToCurrentWeek.current) return;

    const index = Math.min(Math.max(0, currentWeek - 1), Math.max(0, weekListLength - 1));
    didScrollToCurrentWeek.current = true;

    const run = () => {
      weekListRef.current?.scrollToIndex({
        index,
        viewPosition: 0.5,
        animated: false,
      });
    };

    requestAnimationFrame(run);
  }, [activePregnancy, loadingEntries, currentWeek, weekListLength]);

  const getWeekItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      length: TIMELINE_WEEK_ROW_ESTIMATED_LENGTH,
      offset: TIMELINE_LIST_CONTENT_PADDING_TOP + index * TIMELINE_WEEK_ROW_ESTIMATED_LENGTH,
      index,
    }),
    []
  );

  const onScrollToWeekIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      const offset = Math.max(
        0,
        TIMELINE_LIST_CONTENT_PADDING_TOP +
          info.index * (info.averageItemLength || TIMELINE_WEEK_ROW_ESTIMATED_LENGTH)
      );
      weekListRef.current?.scrollToOffset({ offset, animated: false });
    },
    []
  );

  return { weekListRef, getWeekItemLayout, onScrollToWeekIndexFailed };
}
