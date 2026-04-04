import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { AppointmentCreateModal } from '@/components/modals/AppointmentCreateModal';
import { useInvalidateWeekEntry } from '@/hooks/useInvalidateWeekEntry';
import { queryKeys } from '@/lib/queryKeys';
import { deleteWeekAppointment, postWeekAppointment } from '@/lib/services/weekEntry';
import type { WeekEntry } from '@/lib/types';
import { colors } from '@/lib/theme';
import { formatAppointmentDateTime } from '@/lib/utils/formatAppointment';

export type AppointmentsSectionProps = {
  entry: WeekEntry;
  weekEntryRouteId: string;
};

export function AppointmentsSection({ entry, weekEntryRouteId }: AppointmentsSectionProps) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const invalidate = useInvalidateWeekEntry(weekEntryRouteId);
  const [showAdd, setShowAdd] = useState(false);
  const [appointmentDateTime, setAppointmentDateTime] = useState<string | undefined>(undefined);
  const [doctor, setDoctor] = useState('');
  const [notes, setNotes] = useState('');

  const addAppt = useMutation({
    mutationFn: (payload: {
      appointment_date: string;
      doctor_name: string | null;
      notes: string | null;
    }) => postWeekAppointment(entry.id, payload),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.appointments.upcoming });
      setAppointmentDateTime(undefined);
      setDoctor('');
      setNotes('');
      setShowAdd(false);
    },
    onError: () => Alert.alert(t('common.error'), t('week.appointmentSaveFailed')),
  });

  const deleteAppt = useMutation({
    mutationFn: (apptId: number) => deleteWeekAppointment(entry.id, apptId),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.appointments.upcoming });
    },
  });

  return (
    <View className="bg-card rounded-[14px] p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-3 min-w-0 shrink">
          <Text className="text-[17px] font-bold text-text-primary" numberOfLines={2}>
            <FontAwesome name="calendar-check-o" size={16} /> {t('week.appointments')}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setAppointmentDateTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
            setShowAdd(true);
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="p-1"
        >
          <FontAwesome name="plus-circle" size={20} color={colors.primary} />
        </Pressable>
      </View>
      {entry.appointments?.map((a) => (
        <View key={a.id} className="flex-row items-center py-2.5 border-b border-b-surface-muted">
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-text-primary">
              {formatAppointmentDateTime(a.appointment_date, i18n.language)}
            </Text>
            {a.doctor_name && <Text className="text-[13px] text-text-muted mt-0.5">{a.doctor_name}</Text>}
            {a.notes && <Text className="text-[13px] text-text-muted mt-0.5">{a.notes}</Text>}
          </View>
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
          >
            <FontAwesome name="trash-o" size={16} color={colors.iconMuted} />
          </Pressable>
        </View>
      ))}
      {!entry.appointments?.length && <Text className="text-[15px] text-text-muted">{t('week.noAppointments')}</Text>}

      <AppointmentCreateModal
        visible={showAdd}
        appointmentDateTime={appointmentDateTime}
        onChangeAppointmentDateTime={setAppointmentDateTime}
        doctor={doctor}
        notes={notes}
        onChangeDoctor={setDoctor}
        onChangeNotes={setNotes}
        onSubmit={() => {
          if (!appointmentDateTime?.trim()) {
            Alert.alert(t('common.error'), t('week.appointmentDateRequired'));
            return;
          }
          addAppt.mutate({
            appointment_date: appointmentDateTime.trim(),
            doctor_name: doctor.trim() || null,
            notes: notes.trim() || null,
          });
        }}
        onClose={() => {
          if (addAppt.isPending) return;
          setShowAdd(false);
          setAppointmentDateTime(undefined);
          setDoctor('');
          setNotes('');
        }}
        submitting={addAppt.isPending}
        title={t('week.newAppointment')}
        dateTimeLabel={t('week.appointmentDateTime')}
        doctorPlaceholder={t('week.doctorOptional')}
        notesPlaceholder={t('week.notesOptional')}
        addLabel={t('week.addAppointment')}
        cancelLabel={t('common.cancel')}
        locale={i18n.language}
      />
    </View>
  );
}
