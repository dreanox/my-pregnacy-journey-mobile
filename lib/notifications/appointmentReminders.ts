import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Platform } from 'react-native';

import { fetchUpcomingAppointments, postAppointmentReminderAck } from '@/lib/services/appointmentsApi';
import type { Appointment } from '@/lib/types';

dayjs.extend(utc);

export const APPOINTMENT_REMINDER_CHANNEL_ID = 'appointments';

export function appointmentReminderNotificationId(appointmentId: number): string {
  return `appt_reminder_${appointmentId}`;
}

function isRemotePushTrigger(trigger: Notifications.NotificationTrigger): boolean {
  return typeof trigger === 'object' && trigger !== null && 'type' in trigger && trigger.type === 'push';
}

export async function ensureAndroidAppointmentChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(APPOINTMENT_REMINDER_CHANNEL_ID, {
    name: 'Citas',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

function computeFireDate(appointmentDateIso: string, minutesBefore: number): Date | null {
  const fire = dayjs.utc(appointmentDateIso).subtract(minutesBefore, 'minute');
  if (!fire.isValid()) return null;
  if (fire.valueOf() <= Date.now() + 2000) return null;
  return new Date(fire.valueOf());
}

function formatAppointmentTimeForBody(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}

export async function scheduleOrUpdateLocalAppointmentReminder(
  appt: Appointment,
  t: (k: string, o?: Record<string, unknown>) => string,
  locale: string
): Promise<void> {
  const id = appointmentReminderNotificationId(appt.id);
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    /* no-op */
  }

  if (appt.reminder_minutes_before == null) return;

  if (appt.reminder_notified_at) return;

  const when = computeFireDate(appt.appointment_date, appt.reminder_minutes_before);
  if (!when) return;

  await ensureAndroidAppointmentChannel();

  const title = t('notifications.appointmentReminderTitle');
  const body = t('notifications.appointmentReminderBody', {
    time: formatAppointmentTimeForBody(appt.appointment_date, locale),
  });

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      data: {
        type: 'appointment_reminder',
        appointment_id: appt.id,
        week_entry_id: appt.week_entry_id,
      },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
    },
  });
}

export async function cancelLocalAppointmentReminder(appointmentId: number): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(appointmentReminderNotificationId(appointmentId));
  } catch {
    /* no-op */
  }
}

export async function cancelAllLocalAppointmentReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((r) => (r.identifier ?? '').startsWith('appt_reminder_'))
      .map((r) => Notifications.cancelScheduledNotificationAsync(r.identifier as string))
  );
}

export async function reconcileLocalAppointmentRemindersFromServer(
  t: (k: string, o?: Record<string, unknown>) => string,
  locale: string
): Promise<void> {
  let upcoming: Appointment[];
  try {
    upcoming = await fetchUpcomingAppointments();
  } catch {
    return;
  }

  const keep = new Set(upcoming.map((a) => a.id));
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const r of scheduled) {
    const ident = r.identifier ?? '';
    const m = /^appt_reminder_(\d+)$/.exec(ident);
    if (m && !keep.has(Number(m[1]))) {
      await Notifications.cancelScheduledNotificationAsync(ident);
    }
  }

  for (const a of upcoming) {
    await scheduleOrUpdateLocalAppointmentReminder(a, t, locale);
  }
}

/** Suscripciones para híbrido push/local: ack en local; cancelar local duplicado si llegó push. */
export function subscribeAppointmentReminderDelivery(): { remove: () => void } {
  const received = Notifications.addNotificationReceivedListener(async (event) => {
    const data = event.request.content.data as Record<string, unknown> | undefined;
    if (data?.type !== 'appointment_reminder') return;
    const apptId = Number(data.appointment_id);
    if (!Number.isFinite(apptId)) return;

    if (isRemotePushTrigger(event.request.trigger)) {
      await cancelLocalAppointmentReminder(apptId);
      return;
    }

    try {
      await postAppointmentReminderAck(apptId);
    } catch {
      /* offline: el servidor reintentará push si aplica */
    }
  });

  const response = Notifications.addNotificationResponseReceivedListener(async (res) => {
    const data = res.notification.request.content.data as Record<string, unknown> | undefined;
    if (data?.type !== 'appointment_reminder') return;
    const apptId = Number(data.appointment_id);
    if (!Number.isFinite(apptId)) return;

    if (!isRemotePushTrigger(res.notification.request.trigger)) {
      try {
        await postAppointmentReminderAck(apptId);
      } catch {
        /* ignore */
      }
    }
  });

  return {
    remove: () => {
      received.remove();
      response.remove();
    },
  };
}
