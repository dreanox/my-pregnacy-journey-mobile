import { apiInstantToLocal } from '@/lib/date/apiDates';

/** Formats API `appointment_date` (UTC ISO-8601) in the device timezone. */
export function formatAppointmentDateTime(iso: string, locale: string): string {
  const d = apiInstantToLocal(iso);
  if (!d.isValid()) return iso;
  return d.toDate().toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}
