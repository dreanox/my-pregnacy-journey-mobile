/** Formats API `appointment_date` for display; returns raw string if unparsable. */
export function formatAppointmentDateTime(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}
