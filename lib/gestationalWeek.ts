import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';

import { TIMELINE_WEEK_COUNT } from '@/lib/constants/timeline';
import { parseCalendarDateFromApi } from '@/lib/date/apiDates';
import type { Pregnancy } from '@/lib/types';

/** From LMP string (YYYY-MM-DD): EDD (Naegele +280d) and current gestational week (1…TIMELINE_WEEK_COUNT) as used on the timeline. */
export function calcFromLMP(lmp: string) {
  const d = parseCalendarDateFromApi(lmp) ?? dayjs(lmp);
  const dueDate = d.add(280, 'day');
  const currentWeek = Math.max(
    1,
    Math.min(TIMELINE_WEEK_COUNT, Math.floor(dayjs().diff(d, 'day') / 7) + 1)
  );
  return { dueDate, currentWeek };
}

/** LMP (first day of last menstrual period), derived from stored pregnancy fields. */
export function getLmpDay(pregnancy: Pregnancy): Dayjs | null {
  if (pregnancy.last_period_date) {
    const d = parseCalendarDateFromApi(pregnancy.last_period_date);
    return d ? d.startOf('day') : null;
  }
  if (pregnancy.due_date) {
    const d = parseCalendarDateFromApi(pregnancy.due_date);
    return d ? d.subtract(280, 'day').startOf('day') : null;
  }
  return null;
}

/**
 * Inclusive calendar range for gestational week N (1-based), aligned with timeline current-week math:
 * week 1 = days 0–6 after LMP.
 */
export function getGestationalWeekRange(
  weekNumber: number,
  pregnancy: Pregnancy
): { start: Dayjs; end: Dayjs } | null {
  const lmp = getLmpDay(pregnancy);
  if (!lmp || weekNumber < 1 || weekNumber > TIMELINE_WEEK_COUNT) return null;
  const start = lmp.add((weekNumber - 1) * 7, 'day');
  const end = lmp.add(weekNumber * 7 - 1, 'day');
  return { start, end };
}

export function formatGestationalWeekRange(start: Dayjs, end: Dayjs, language: string): string {
  const loc = language.startsWith('es') ? 'es' : 'en';
  const s = start.locale(loc);
  const e = end.locale(loc);
  const sameMonth = s.month() === e.month() && s.year() === e.year();
  if (sameMonth) {
    return `${s.format('D')} – ${e.format('D MMM YYYY')}`;
  }
  if (s.year() === e.year()) {
    return `${s.format('D MMM')} – ${e.format('D MMM YYYY')}`;
  }
  return `${s.format('D MMM YYYY')} – ${e.format('D MMM YYYY')}`;
}
