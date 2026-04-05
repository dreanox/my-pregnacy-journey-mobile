/**
 * Text and count limits aligned with the Laravel API (`context.md` → Input limits).
 */
export const CONTENT_LIMITS = {
  appointmentReminderMinutesMin: 5,
  appointmentReminderMinutesMax: 120,
  appointmentReminderMinutesStep: 5,
  /** Valor inicial al activar el recordatorio en el modal de cita. */
  appointmentReminderMinutesDefault: 30,
  customSymptomNameMax: 50,
  noteContentMax: 1500,
  medicationNameMax: 80,
  photosPerWeekMax: 10,
  appointmentDoctorMax: 255,
  appointmentNotesMax: 500,
  feedbackMessageMax: 2500,
} as const;
