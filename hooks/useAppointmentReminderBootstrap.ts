import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/lib/auth';
import {
  attachOneSignalAppointmentReminderDedup,
  requestOneSignalPushPermission,
  setOneSignalExternalUserId,
  setOneSignalUserLanguage,
} from '@/lib/notifications/oneSignalMobile';
import {
  reconcileLocalAppointmentRemindersFromServer,
  subscribeAppointmentReminderDelivery,
} from '@/lib/notifications/appointmentReminders';

export function useAppointmentReminderBootstrap() {
  const { isAuthenticated, user } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const removeOs = attachOneSignalAppointmentReminderDedup();
    const delivery = subscribeAppointmentReminderDelivery();
    return () => {
      removeOs();
      delivery.remove();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setOneSignalExternalUserId(null);
      return;
    }
    setOneSignalExternalUserId(user.id);
    setOneSignalUserLanguage(i18n.language);
    requestOneSignalPushPermission();
    void reconcileLocalAppointmentRemindersFromServer(t, i18n.language);

    const onState = (state: AppStateStatus) => {
      if (state === 'active') {
        setOneSignalExternalUserId(user.id);
        setOneSignalUserLanguage(i18n.language);
        void reconcileLocalAppointmentRemindersFromServer(t, i18n.language);
      }
    };
    const sub = AppState.addEventListener('change', onState);
    return () => sub.remove();
  }, [isAuthenticated, user?.id, t, i18n.language]);
}
