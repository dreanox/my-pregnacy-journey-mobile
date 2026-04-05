import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import type { NotificationClickEvent, NotificationWillDisplayEvent } from 'react-native-onesignal';

import { getOneSignalAppId } from '@/lib/constants/oneSignal';
import { cancelLocalAppointmentReminder } from '@/lib/notifications/appointmentReminders';

type OneSignalModule = typeof import('react-native-onesignal');

let initialized = false;
let oneSignalNs: OneSignalModule | null | undefined;

/** OneSignal no está en el binario de Expo Go; hace falta dev build / EAS. */
function isOneSignalNativeAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

function loadOneSignal(): OneSignalModule | null {
  if (!isOneSignalNativeAvailable()) return null;
  if (oneSignalNs !== undefined) return oneSignalNs;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- evita import estático (crashea en Expo Go)
    oneSignalNs = require('react-native-onesignal') as OneSignalModule;
  } catch {
    oneSignalNs = null;
  }
  return oneSignalNs;
}

export function ensureOneSignalInitialized(): void {
  const appId = getOneSignalAppId();
  if (!appId || initialized) return;
  const mod = loadOneSignal();
  if (!mod) return;
  try {
    mod.OneSignal.initialize(appId);
    initialized = true;
  } catch {
    /* prebuild / linking pendiente */
  }
}

export function setOneSignalExternalUserId(userId: number | null): void {
  const mod = loadOneSignal();
  if (!mod) return;
  try {
    if (userId != null) {
      mod.OneSignal.login(String(userId));
    } else {
      mod.OneSignal.logout();
    }
  } catch {
    /* ignore */
  }
}

export function requestOneSignalPushPermission(): void {
  const mod = loadOneSignal();
  if (!mod) return;
  try {
    void mod.OneSignal.Notifications.requestPermission(true);
  } catch {
    /* ignore */
  }
}

export function setOneSignalUserLanguage(languageTag: string): void {
  const mod = loadOneSignal();
  if (!mod) return;
  try {
    const code = languageTag.split('-')[0]?.slice(0, 2);
    if (code) mod.OneSignal.User.setLanguage(code);
  } catch {
    /* ignore */
  }
}

function handleAdditionalData(addl: Record<string, unknown> | undefined): void {
  if (addl?.type !== 'appointment_reminder') return;
  const apptId = Number(addl.appointment_id);
  if (Number.isFinite(apptId)) void cancelLocalAppointmentReminder(apptId);
}

/** Cancela la notificación local duplicada cuando llega (o se abre) un push de OneSignal. */
export function attachOneSignalAppointmentReminderDedup(): () => void {
  const mod = loadOneSignal();
  if (!mod) return () => {};

  const onForeground = (event: NotificationWillDisplayEvent) => {
    try {
      const n = event.getNotification();
      handleAdditionalData(n.additionalData as Record<string, unknown> | undefined);
      n.display();
    } catch {
      /* ignore */
    }
  };

  const onClick = (event: NotificationClickEvent) => {
    try {
      handleAdditionalData(event.notification.additionalData as Record<string, unknown> | undefined);
    } catch {
      /* ignore */
    }
  };

  try {
    mod.OneSignal.Notifications.addEventListener('foregroundWillDisplay', onForeground);
    mod.OneSignal.Notifications.addEventListener('click', onClick);
  } catch {
    return () => {};
  }

  return () => {
    try {
      mod.OneSignal.Notifications.removeEventListener('foregroundWillDisplay', onForeground);
      mod.OneSignal.Notifications.removeEventListener('click', onClick);
    } catch {
      /* ignore */
    }
  };
}
