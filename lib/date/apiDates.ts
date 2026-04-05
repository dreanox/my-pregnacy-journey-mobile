import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const LOCAL_WALL_DATETIME = 'YYYY-MM-DD HH:mm:ss';

/** Parse strict local wall datetime used in appointment pickers. */
export function parseLocalWallDateTime(wall: string): dayjs.Dayjs {
  const strict = dayjs(wall, LOCAL_WALL_DATETIME, true);
  return strict.isValid() ? strict : dayjs(wall);
}

const REMINDER_DISPLAY_MAX = 255;

/**
 * Misma idea que la hora mostrada en la lista de citas: local + locale, para guardar en API y usar en el push (`:time`).
 */
export function formatLocalWallForAppointmentReminderDisplay(wall: string, locale: string): string {
  const d = parseLocalWallDateTime(wall.trim());
  if (!d.isValid()) return wall.trim().slice(0, REMINDER_DISPLAY_MAX);
  const formatted = d.toDate().toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  return formatted.length > REMINDER_DISPLAY_MAX ? formatted.slice(0, REMINDER_DISPLAY_MAX) : formatted;
}

/** App language → backend push template key (`es` | `en`), aligned with `ReminderLocale` in Laravel. */
export function reminderPushTemplateLocale(languageTag: string): 'es' | 'en' {
  return languageTag.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function formatLocalWallDateTime(d: dayjs.Dayjs): string {
  return d.format(LOCAL_WALL_DATETIME);
}

/** API instant (ISO-8601, UTC) → dayjs in the device timezone. */
export function apiInstantToLocal(iso: string): dayjs.Dayjs {
  const u = dayjs.utc(iso);
  if (!u.isValid()) return dayjs(iso);
  return u.local();
}

/** Local wall datetime from pickers → ISO UTC for `appointment_date` in the API. */
export function localWallDateTimeToApiIso(wall: string): string {
  return parseLocalWallDateTime(wall.trim()).toISOString();
}

/**
 * Calendar-only fields from the API (`due_date`, `last_period_date`): use the date part only
 * so a serialized midnight UTC does not shift the calendar day in local TZ.
 */
export function parseCalendarDateFromApi(value: string | null | undefined): dayjs.Dayjs | null {
  if (value == null || value === '') return null;
  const ymd = value.slice(0, 10);
  const d = dayjs(ymd, 'YYYY-MM-DD', true);
  return d.isValid() ? d : null;
}
