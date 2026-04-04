/**
 * Timeline (week list) layout — keep in sync with `contentContainerClassName` (`p-4` → 16) and row UI.
 */
export const TIMELINE_LIST_CONTENT_PADDING_TOP = 16;

/** Estimated row height (card + `mb-2`) for FlatList `getItemLayout` / `scrollToIndex`. */
export const TIMELINE_WEEK_ROW_ESTIMATED_LENGTH = 118;

/** Weeks 1..N on the pregnancy timeline (inclusive cap). */
export const TIMELINE_WEEK_COUNT = 42;

export const TIMELINE_FLATLIST_INITIAL_NUM_RENDER = TIMELINE_WEEK_COUNT;

export const TIMELINE_FLATLIST_WINDOW_SIZE = 21;
