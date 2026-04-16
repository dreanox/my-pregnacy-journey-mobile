import { useCallback, useLayoutEffect, useRef } from 'react';
import { FlatList, InteractionManager } from 'react-native';

import {
  TIMELINE_LIST_CONTENT_PADDING_TOP,
  TIMELINE_WEEK_ROW_ESTIMATED_LENGTH,
} from '@/lib/constants/timeline';
import type { Pregnancy } from '@/lib/types';

/**
 * Scrolls timeline FlatList so current gestational week sits at top (like week 1).
 * Week 1: no scroll (already at top).
 * Re-runs when `focusAlignNonce` bumps (user returned to this tab) so scroll + animation show again.
 */
export function useTimelineWeekListScroll(options: {
  activePregnancy: Pregnancy | undefined;
  loadingEntries: boolean;
  currentWeek: number;
  weekListLength: number;
  /** Increment when timeline tab gains focus again (not first mount). */
  focusAlignNonce: number;
}) {
  const { activePregnancy, loadingEntries, currentWeek, weekListLength, focusAlignNonce } = options;
  const weekListRef = useRef<FlatList>(null);
  const lastPregnancyIdForScroll = useRef<number | null>(null);
  /** Week index we last aligned to top; re-scroll when live week advances or tab refocus. */
  const lastAlignedWeek = useRef<number | null>(null);
  const lastFocusAlignNonce = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!activePregnancy || loadingEntries) return;
    if (lastPregnancyIdForScroll.current !== activePregnancy.id) {
      lastPregnancyIdForScroll.current = activePregnancy.id;
      lastAlignedWeek.current = null;
    }
    if (lastFocusAlignNonce.current !== null && lastFocusAlignNonce.current !== focusAlignNonce) {
      lastAlignedWeek.current = null;
    }
    lastFocusAlignNonce.current = focusAlignNonce;

    if (lastAlignedWeek.current === currentWeek) return;

    lastAlignedWeek.current = currentWeek;

    const index = Math.min(Math.max(0, currentWeek - 1), Math.max(0, weekListLength - 1));

    if (currentWeek <= 1) return;

    const run = () => {
      weekListRef.current?.scrollToIndex({
        index,
        viewPosition: 0,
        animated: true,
      });
    };

    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(run);
      });
    });
  }, [activePregnancy, loadingEntries, currentWeek, weekListLength, focusAlignNonce]);

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
      weekListRef.current?.scrollToOffset({ offset, animated: true });
    },
    []
  );

  return { weekListRef, getWeekItemLayout, onScrollToWeekIndexFailed };
}
