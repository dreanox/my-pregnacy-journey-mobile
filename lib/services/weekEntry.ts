import api from '@/lib/api';
import type { Appointment, Pregnancy, WeekEntry } from '@/lib/types';

export type CreatePregnancyPayload = {
  last_period_date?: string;
  due_date?: string;
  current_week?: number;
};

export async function fetchPregnancies(): Promise<Pregnancy[]> {
  const { data } = await api.get<Pregnancy[]>('/pregnancies');
  return data;
}

export async function createPregnancy(payload: CreatePregnancyPayload): Promise<Pregnancy> {
  const { data } = await api.post<Pregnancy>('/pregnancies', payload);
  return data;
}

export type UpdatePregnancyPayload = {
  due_date?: string | null;
  last_period_date?: string | null;
  current_week?: number;
  is_active?: boolean;
};

export async function updatePregnancy(
  pregnancyId: number,
  payload: UpdatePregnancyPayload
): Promise<Pregnancy> {
  const { data } = await api.put<Pregnancy>(`/pregnancies/${pregnancyId}`, payload);
  return data;
}

export async function fetchWeekEntriesByPregnancy(pregnancyId: number): Promise<WeekEntry[]> {
  const { data } = await api.get<WeekEntry[]>(`/pregnancies/${pregnancyId}/week-entries`);
  return data;
}

export async function createWeekEntryForPregnancy(
  pregnancyId: number,
  weekNumber: number
): Promise<WeekEntry> {
  const { data } = await api.post<WeekEntry>(`/pregnancies/${pregnancyId}/week-entries`, {
    week_number: weekNumber,
  });
  return data;
}

export async function fetchWeekEntry(pregnancyId: number, weekEntryId: string): Promise<WeekEntry> {
  const { data } = await api.get<WeekEntry>(
    `/pregnancies/${pregnancyId}/week-entries/${weekEntryId}`
  );
  return data;
}

export async function updateWeekEntryWeight(
  pregnancyId: number,
  weekEntryId: string,
  weight: number | null
): Promise<void> {
  await api.put(`/pregnancies/${pregnancyId}/week-entries/${weekEntryId}`, { weight });
}

export async function putWeekEntrySymptoms(
  weekEntryId: number,
  symptoms: { name: string; is_custom: boolean }[]
): Promise<void> {
  await api.put(`/week-entries/${weekEntryId}/symptoms`, { symptoms });
}

export async function postWeekNote(weekEntryId: number, content: string): Promise<void> {
  await api.post(`/week-entries/${weekEntryId}/notes`, { content });
}

export async function putWeekNote(
  weekEntryId: number,
  noteId: number,
  content: string
): Promise<void> {
  await api.put(`/week-entries/${weekEntryId}/notes/${noteId}`, { content });
}

export async function deleteWeekNote(weekEntryId: number, noteId: number): Promise<void> {
  await api.delete(`/week-entries/${weekEntryId}/notes/${noteId}`);
}

export async function postMedication(
  weekEntryId: number,
  body: { name: string; dosage: string | null }
): Promise<void> {
  await api.post(`/week-entries/${weekEntryId}/medications`, body);
}

export async function putMedication(
  weekEntryId: number,
  medicationId: number,
  body: { name: string; dosage: string | null }
): Promise<void> {
  await api.put(`/week-entries/${weekEntryId}/medications/${medicationId}`, body);
}

export async function deleteMedication(weekEntryId: number, medicationId: number): Promise<void> {
  await api.delete(`/week-entries/${weekEntryId}/medications/${medicationId}`);
}

export async function postWeekPhoto(weekEntryId: number, form: FormData): Promise<void> {
  await api.post(`/week-entries/${weekEntryId}/photos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteWeekPhoto(weekEntryId: number, photoId: number): Promise<void> {
  await api.delete(`/week-entries/${weekEntryId}/photos/${photoId}`);
}

export async function postWeekAppointment(
  weekEntryId: number,
  body: {
    appointment_date: string;
    doctor_name: string | null;
    notes: string | null;
    reminder_minutes_before?: number | null;
    reminder_display_time?: string | null;
    reminder_locale?: 'es' | 'en' | null;
  }
): Promise<Appointment> {
  const { data } = await api.post<Appointment>(`/week-entries/${weekEntryId}/appointments`, body);
  return data;
}

export async function putWeekAppointment(
  weekEntryId: number,
  appointmentId: number,
  body: {
    appointment_date: string;
    doctor_name: string | null;
    notes: string | null;
    reminder_minutes_before?: number | null;
    reminder_display_time?: string | null;
    reminder_locale?: 'es' | 'en' | null;
  }
): Promise<Appointment> {
  const { data } = await api.put<Appointment>(
    `/week-entries/${weekEntryId}/appointments/${appointmentId}`,
    body
  );
  return data;
}

export async function deleteWeekAppointment(weekEntryId: number, appointmentId: number): Promise<void> {
  await api.delete(`/week-entries/${weekEntryId}/appointments/${appointmentId}`);
}
