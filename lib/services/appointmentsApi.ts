import api from '@/lib/api';
import type { Appointment } from '@/lib/types';

export async function fetchUpcomingAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/appointments/upcoming');
  return data;
}

export async function postAppointmentReminderAck(appointmentId: number): Promise<void> {
  await api.post(`/appointments/${appointmentId}/reminder-ack`);
}
