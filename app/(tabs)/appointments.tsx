import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { useUpcomingAppointments } from '@/hooks/useUpcomingAppointments';
import { formatAppointmentDateTime } from '@/lib/utils/formatAppointment';
import { colors } from '@/lib/theme';

export default function AppointmentsScreen() {
  const { t, i18n } = useTranslation();
  const { data: appointments, isPending: isLoading } = useUpcomingAppointments();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-8 bg-surface">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!appointments?.length) {
    return (
      <View className="flex-1 justify-center items-center p-8 bg-surface">
        <Text className="text-[64px] mb-4">🏥</Text>
        <Text className="text-[22px] font-bold text-text-primary mb-2">{t('appointments.noUpcoming')}</Text>
        <Text className="text-sm text-text-muted text-center">{t('appointments.addFromWeekly')}</Text>
        <MedicalDisclaimer variant="inline" className="mt-8 max-w-[320px]" />
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id.toString()}
      contentContainerClassName="p-4 pb-6"
      ListFooterComponent={<MedicalDisclaimer variant="inline" className="mt-3 px-1" />}
      renderItem={({ item }) => (
        <View className="flex-row bg-card rounded-[14px] p-4 mb-2.5 border border-border">
          <View className="w-[52px] min-h-[52px] rounded-xl bg-primary-soft justify-center items-center mr-[14px] py-1">
            <Text className="text-xl font-bold text-primary">
              {new Date(item.appointment_date).getDate()}
            </Text>
            <Text className="text-[11px] text-primary font-semibold uppercase">
              {new Date(item.appointment_date).toLocaleDateString(i18n.language, { month: 'short' })}
            </Text>
            <Text className="text-[10px] text-primary font-medium mt-0.5">
              {new Date(item.appointment_date).toLocaleTimeString(i18n.language, { timeStyle: 'short' })}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-semibold text-text-primary mb-1">
              {formatAppointmentDateTime(item.appointment_date, i18n.language)}
            </Text>
            {item.doctor_name && (
              <Text className="text-base font-semibold text-text-primary mb-1">
                <FontAwesome name="user-md" size={14} /> {item.doctor_name}
              </Text>
            )}
            {item.notes && <Text className="text-[13px] text-text-secondary mb-1" numberOfLines={2}>{item.notes}</Text>}
            {item.week_entry && (
              <Text className="text-xs text-primary font-medium">{t('appointments.week', { number: item.week_entry.week_number })}</Text>
            )}
          </View>
        </View>
      )}
    />
  );
}
