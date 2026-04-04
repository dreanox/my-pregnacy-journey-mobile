import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import DateTimePicker, { type DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

import { APPOINTMENT_TIME_PICKER_CONTAINER_HEIGHT, INPUT_ACCESSORY_IDS } from '@/lib/constants/ui';
import { colors } from '@/lib/theme';

type PickerSegment = 'date' | 'time';

export type AppointmentCreateModalProps = {
  visible: boolean;
  /** Local wall time `YYYY-MM-DD HH:mm:ss` for the API, or unset until the user picks. */
  appointmentDateTime: string | undefined;
  onChangeAppointmentDateTime: (v: string | undefined) => void;
  doctor: string;
  notes: string;
  onChangeDoctor: (v: string) => void;
  onChangeNotes: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  title: string;
  dateTimeLabel: string;
  doctorPlaceholder: string;
  notesPlaceholder: string;
  addLabel: string;
  cancelLabel: string;
  locale: string;
  /** True while the create request is in flight (shows spinner on the submit button). */
  submitting?: boolean;
};

export function AppointmentCreateModal({
  visible,
  appointmentDateTime,
  onChangeAppointmentDateTime,
  doctor,
  notes,
  onChangeDoctor,
  onChangeNotes,
  onSubmit,
  onClose,
  title,
  dateTimeLabel,
  doctorPlaceholder,
  notesPlaceholder,
  addLabel,
  cancelLabel,
  locale,
  submitting = false,
}: AppointmentCreateModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const defaultStyles = useDefaultStyles();
  const [segment, setSegment] = useState<PickerSegment>('date');

  useEffect(() => {
    if (visible) setSegment('date');
  }, [visible]);

  const pickerDate = appointmentDateTime ? dayjs(appointmentDateTime).toDate() : new Date();

  const pickerStyles = useMemo(
    () => ({
      ...defaultStyles,
      selected: { backgroundColor: colors.primary, borderRadius: 20 },
      selected_label: { color: colors.white, fontWeight: '600' as const },
      today: { borderWidth: 1, borderColor: colors.primary, borderRadius: 20 },
      today_label: { color: colors.primary },
      button_prev_image: { tintColor: colors.primary },
      button_next_image: { tintColor: colors.primary },
    }),
    [defaultStyles]
  );

  const pickerLocale = locale.startsWith('es') ? 'es' : 'en';

  const applyDatePart = (picked: DateType) => {
    if (picked == null) {
      onChangeAppointmentDateTime(undefined);
      return;
    }
    const p = dayjs(picked);
    const base = appointmentDateTime ? dayjs(appointmentDateTime) : dayjs();
    onChangeAppointmentDateTime(
      p.hour(base.hour()).minute(base.minute()).second(base.second()).format('YYYY-MM-DD HH:mm:ss')
    );
  };

  const applyTimePart = (picked: DateType) => {
    if (picked == null) {
      onChangeAppointmentDateTime(undefined);
      return;
    }
    const p = dayjs(picked);
    const base = appointmentDateTime ? dayjs(appointmentDateTime) : dayjs();
    onChangeAppointmentDateTime(
      base.hour(p.hour()).minute(p.minute()).second(p.second()).format('YYYY-MM-DD HH:mm:ss')
    );
  };

  const dismissKeyboardAndSubmit = () => {
    Keyboard.dismiss();
    onSubmit();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_IDS.appointmentNotes}>
          <View className="bg-card border-t border-border flex-row justify-end items-center px-4 py-2.5">
            <Pressable onPress={() => Keyboard.dismiss()} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
              <Text className="text-[16px] font-semibold text-primary">{t('common.done')}</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-overlay"
            onPress={submitting ? undefined : onClose}
            disabled={submitting}
          />
          <View
            className="bg-card rounded-t-[24px] p-6"
            style={{ paddingBottom: Math.max(insets.bottom, 20) + 16 }}
          >
            <ScrollView
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled
            >
              <Text className="text-[22px] font-bold text-text-primary mb-5">{title}</Text>
              <Text className="text-[14px] font-semibold text-text-secondary mb-2">{dateTimeLabel}</Text>

              <View className="flex-row rounded-[12px] bg-card-subtle border border-border p-1 mb-2">
                <Pressable
                  onPress={() => setSegment('date')}
                  disabled={submitting}
                  className={`flex-1 py-2.5 rounded-[10px] items-center ${segment === 'date' ? 'bg-primary' : ''} ${submitting ? 'opacity-50' : ''}`}
                >
                  <Text
                    className={`text-[15px] font-semibold ${segment === 'date' ? 'text-white' : 'text-text-secondary'}`}
                  >
                    {t('week.appointmentTabCalendar')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSegment('time')}
                  disabled={submitting}
                  className={`flex-1 py-2.5 rounded-[10px] items-center ${segment === 'time' ? 'bg-primary' : ''} ${submitting ? 'opacity-50' : ''}`}
                >
                  <Text
                    className={`text-[15px] font-semibold ${segment === 'time' ? 'text-white' : 'text-text-secondary'}`}
                  >
                    {t('week.appointmentTabTime')}
                  </Text>
                </Pressable>
              </View>

              <Text className="text-[12px] text-text-muted mb-2">
                {segment === 'date' ? t('week.appointmentCalendarHint') : t('week.appointmentTimeHint')}
              </Text>

              <View
                className="bg-card-subtle rounded-[12px] border border-border overflow-hidden mb-4 p-1"
                pointerEvents={submitting ? 'none' : 'auto'}
              >
                {segment === 'date' ? (
                  <DateTimePicker
                    key="appt-date"
                    mode="single"
                    locale={pickerLocale}
                    date={pickerDate}
                    timePicker={false}
                    onChange={({ date }) => applyDatePart(date)}
                    styles={pickerStyles}
                  />
                ) : (
                  <DateTimePicker
                    key="appt-time"
                    mode="single"
                    locale={pickerLocale}
                    date={pickerDate}
                    timePicker
                    initialView="time"
                    hideHeader
                    containerHeight={APPOINTMENT_TIME_PICKER_CONTAINER_HEIGHT}
                    onChange={({ date }) => applyTimePart(date)}
                    styles={pickerStyles}
                  />
                )}
              </View>
              <TextInput
                className="bg-card-subtle rounded-[10px] px-[14px] py-3 text-[15px] border border-border text-text-primary mb-2"
                placeholder={doctorPlaceholder}
                placeholderTextColor={colors.textPlaceholder}
                value={doctor}
                onChangeText={onChangeDoctor}
                editable={!submitting}
              />
              <View className="flex-row items-start justify-between gap-2 mb-1">
                <Text className="text-[12px] text-text-muted flex-1" style={{ flexShrink: 1 }}>
                  {t('week.notesMultilineHint')}
                </Text>
                {Platform.OS === 'android' ? (
                  <Pressable
                    onPress={() => Keyboard.dismiss()}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={submitting}
                  >
                    <Text className="text-[14px] font-semibold text-primary">{t('common.done')}</Text>
                  </Pressable>
                ) : null}
              </View>
              <TextInput
                className="bg-card-subtle rounded-[10px] px-[14px] py-3 text-[15px] border border-border text-text-primary mb-2 min-h-[80px]"
                style={{ textAlignVertical: 'top' }}
                placeholder={notesPlaceholder}
                placeholderTextColor={colors.textPlaceholder}
                value={notes}
                onChangeText={onChangeNotes}
                multiline
                editable={!submitting}
                inputAccessoryViewID={
                  Platform.OS === 'ios' ? INPUT_ACCESSORY_IDS.appointmentNotes : undefined
                }
              />
              <Pressable
                className={`bg-primary rounded-[12px] py-4 items-center mt-1 flex-row justify-center gap-2 ${submitting ? 'opacity-90' : ''}`}
                onPress={submitting ? undefined : dismissKeyboardAndSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text className="text-white text-[17px] font-semibold">{addLabel}</Text>
                )}
              </Pressable>
              <Pressable
                className={`items-center mt-3 mb-1 ${submitting ? 'opacity-40' : ''}`}
                onPress={submitting ? undefined : onClose}
                disabled={submitting}
              >
                <Text className="text-text-secondary text-[16px]">{cancelLabel}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
