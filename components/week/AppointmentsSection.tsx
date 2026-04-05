import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { AppointmentCreateModal } from '@/components/modals/AppointmentCreateModal';
import {
  apiInstantToLocal,
  formatLocalWallDateTime,
  formatLocalWallForAppointmentReminderDisplay,
  localWallDateTimeToApiIso,
  reminderPushTemplateLocale,
} from '@/lib/date/apiDates';
import {
  cancelLocalAppointmentReminder,
  scheduleOrUpdateLocalAppointmentReminder,
} from '@/lib/notifications/appointmentReminders';
import { useInvalidateWeekEntry } from '@/hooks/useInvalidateWeekEntry';
import { CONTENT_LIMITS } from '@/lib/constants/contentLimits';
import { showError } from '@/lib/errorHelper';
import { queryKeys } from '@/lib/queryKeys';
import {
  deleteWeekAppointment,
  postWeekAppointment,
  putWeekAppointment,
} from '@/lib/services/weekEntry';
import type { Appointment, WeekEntry } from '@/lib/types';
import { colors } from '@/lib/theme';
import { formatAppointmentDateTime } from '@/lib/utils/formatAppointment';

export type AppointmentsSectionProps = {
  entry: WeekEntry;
  weekEntryRouteId: string;
  readOnly?: boolean;
};

export function AppointmentsSection({ entry, weekEntryRouteId, readOnly = false }: AppointmentsSectionProps) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const invalidate = useInvalidateWeekEntry(weekEntryRouteId);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingApptId, setEditingApptId] = useState<number | null>(null);
  const [appointmentDateTime, setAppointmentDateTime] = useState<string | undefined>(undefined);
  const [doctor, setDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | null>(null);

  const resetAppointmentModal = () => {
    setModalVisible(false);
    setModalMode('add');
    setEditingApptId(null);
    setAppointmentDateTime(undefined);
    setDoctor('');
    setNotes('');
    setReminderMinutesBefore(null);
  };

  const openAdd = () => {
    setModalMode('add');
    setEditingApptId(null);
    setAppointmentDateTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    setDoctor('');
    setNotes('');
    setReminderMinutesBefore(null);
    setModalVisible(true);
  };

  const openEdit = (a: Appointment) => {
    setModalMode('edit');
    setEditingApptId(a.id);
    setAppointmentDateTime(formatLocalWallDateTime(apiInstantToLocal(a.appointment_date)));
    setDoctor(a.doctor_name ?? '');
    setNotes(a.notes ?? '');
    setReminderMinutesBefore(a.reminder_minutes_before ?? null);
    setModalVisible(true);
  };

  const addAppt = useMutation({
    mutationFn: (payload: {
      appointment_date: string;
      doctor_name: string | null;
      notes: string | null;
      reminder_minutes_before: number | null;
      reminder_display_time: string | null;
      reminder_locale: 'es' | 'en';
    }) => postWeekAppointment(entry.id, payload),
    onSuccess: (saved) => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.appointments.upcoming });
      void scheduleOrUpdateLocalAppointmentReminder(saved, t, i18n.language);
      resetAppointmentModal();
    },
    onError: (e) => showError(t('common.error'), e, t('week.appointmentSaveFailed')),
  });

  const updateAppt = useMutation({
    mutationFn: (payload: {
      apptId: number;
      appointment_date: string;
      doctor_name: string | null;
      notes: string | null;
      reminder_minutes_before: number | null;
      reminder_display_time: string | null;
      reminder_locale: 'es' | 'en';
    }) =>
      putWeekAppointment(entry.id, payload.apptId, {
        appointment_date: payload.appointment_date,
        doctor_name: payload.doctor_name,
        notes: payload.notes,
        reminder_minutes_before: payload.reminder_minutes_before,
        reminder_display_time: payload.reminder_display_time,
        reminder_locale: payload.reminder_locale,
      }),
    onSuccess: (saved) => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.appointments.upcoming });
      void scheduleOrUpdateLocalAppointmentReminder(saved, t, i18n.language);
      resetAppointmentModal();
    },
    onError: (e) => showError(t('common.error'), e, t('week.appointmentSaveFailed')),
  });

  const deleteAppt = useMutation({
    mutationFn: (apptId: number) => deleteWeekAppointment(entry.id, apptId),
    onSuccess: (_, apptId) => {
      void cancelLocalAppointmentReminder(apptId);
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.appointments.upcoming });
    },
  });

  const submitting = addAppt.isPending || updateAppt.isPending;

  const closeModal = () => {
    if (submitting) return;
    resetAppointmentModal();
  };

  const submit = () => {
    if (!appointmentDateTime?.trim()) {
      Alert.alert(t('common.error'), t('week.appointmentDateRequired'));
      return;
    }
    const wall = appointmentDateTime.trim();
    const body = {
      appointment_date: localWallDateTimeToApiIso(wall),
      doctor_name: doctor.trim() || null,
      notes: notes.trim() || null,
      reminder_minutes_before: reminderMinutesBefore,
      reminder_display_time: formatLocalWallForAppointmentReminderDisplay(wall, i18n.language),
      reminder_locale: reminderPushTemplateLocale(i18n.language),
    };
    if (modalMode === 'edit' && editingApptId != null) {
      updateAppt.mutate({ apptId: editingApptId, ...body });
    } else {
      addAppt.mutate(body);
    }
  };

  return (
    <View className="bg-card rounded-[14px] p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-3 min-w-0 shrink">
          <Text className="text-[17px] font-bold text-text-primary" numberOfLines={2}>
            <FontAwesome name="calendar-check-o" size={16} /> {t('week.appointments')}
          </Text>
        </View>
        {!readOnly && (
          <Pressable
            onPress={openAdd}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="p-1"
          >
            <FontAwesome name="plus-circle" size={20} color={colors.primary} />
          </Pressable>
        )}
      </View>
      {entry.appointments?.map((a) => (
        <View key={a.id} className="flex-row items-center py-2.5 border-b border-b-surface-muted">
          {readOnly ? (
            <View className="flex-1 min-w-0">
              <Text className="text-[15px] font-semibold text-text-primary">
                {formatAppointmentDateTime(a.appointment_date, i18n.language)}
              </Text>
              {a.doctor_name ? (
                <Text className="text-[13px] text-text-muted mt-0.5">{a.doctor_name}</Text>
              ) : null}
              {a.notes ? (
                <Text className="text-[13px] text-text-muted mt-0.5" numberOfLines={4}>
                  {a.notes}
                </Text>
              ) : null}
            </View>
          ) : (
            <>
              <Pressable
                className="flex-1 flex-row items-center min-w-0 pr-2 active:opacity-80"
                onPress={() => openEdit(a)}
              >
                <View className="flex-1 min-w-0">
                  <Text className="text-[15px] font-semibold text-text-primary">
                    {formatAppointmentDateTime(a.appointment_date, i18n.language)}
                  </Text>
                  {a.doctor_name ? (
                    <Text className="text-[13px] text-text-muted mt-0.5">{a.doctor_name}</Text>
                  ) : null}
                  {a.notes ? (
                    <Text className="text-[13px] text-text-muted mt-0.5" numberOfLines={2}>
                      {a.notes}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-row items-center shrink-0 gap-1 pl-1">
                  <Text className="text-[12px] font-semibold text-primary" numberOfLines={1}>
                    {t('week.editRowHint')}
                  </Text>
                  <FontAwesome name="chevron-right" size={14} color={colors.primary} />
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(t('week.deleteAppointmentTitle'), t('week.deleteAppointmentMessage'), [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                      text: t('common.delete'),
                      style: 'destructive',
                      onPress: () => deleteAppt.mutate(a.id),
                    },
                  ])
                }
                className="w-11 items-center justify-center py-2 pl-2"
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              >
                <FontAwesome name="trash-o" size={16} color={colors.iconMuted} />
              </Pressable>
            </>
          )}
        </View>
      ))}
      {!entry.appointments?.length && <Text className="text-[15px] text-text-muted">{t('week.noAppointments')}</Text>}

      <AppointmentCreateModal
        visible={!readOnly && modalVisible}
        appointmentDateTime={appointmentDateTime}
        onChangeAppointmentDateTime={setAppointmentDateTime}
        doctor={doctor}
        notes={notes}
        onChangeDoctor={setDoctor}
        onChangeNotes={setNotes}
        onSubmit={submit}
        onClose={closeModal}
        title={modalMode === 'edit' ? t('week.editAppointment') : t('week.newAppointment')}
        dateTimeLabel={t('week.appointmentDateTime')}
        doctorPlaceholder={t('week.doctorOptional')}
        notesPlaceholder={t('week.notesOptional')}
        addLabel={t('week.addAppointment')}
        primaryButtonLabel={modalMode === 'edit' ? t('common.save') : undefined}
        cancelLabel={t('common.cancel')}
        locale={i18n.language}
        submitting={submitting}
        doctorMaxLength={CONTENT_LIMITS.appointmentDoctorMax}
        notesMaxLength={CONTENT_LIMITS.appointmentNotesMax}
        reminderMinutesBefore={reminderMinutesBefore}
        onChangeReminderMinutesBefore={setReminderMinutesBefore}
        reminderSwitchLabel={t('week.reminderSwitch')}
        reminderHint={t('week.reminderHint')}
        reminderMinutesSummary={t('week.reminderMinutes', {
          minutes: reminderMinutesBefore ?? CONTENT_LIMITS.appointmentReminderMinutesDefault,
        })}
      />
    </View>
  );
}
