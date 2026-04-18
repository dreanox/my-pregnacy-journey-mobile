import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import DateTimePicker, { type CalendarDay, type DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

import { CharacterLimitNotice } from '@/components/CharacterLimitNotice';
import { parseLocalWallDateTime } from '@/lib/date/apiDates';
import { CONTENT_LIMITS } from '@/lib/constants/contentLimits';
import { APPOINTMENT_TIME_PICKER_CONTAINER_HEIGHT, INPUT_ACCESSORY_IDS } from '@/lib/constants/ui';
import { colors } from '@/lib/theme';

type PickerSegment = 'date' | 'time';

export type AppointmentCreateModalProps = {
  visible: boolean;
  /** Local wall time `YYYY-MM-DD HH:mm:ss` (converted to UTC ISO on submit in the parent). */
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
  /** Primary button label (e.g. Save when editing). Defaults to `addLabel`. */
  primaryButtonLabel?: string;
  doctorMaxLength?: number;
  notesMaxLength?: number;
  /** null = sin recordatorio; 5–120 minutos antes de la cita. */
  reminderMinutesBefore: number | null;
  onChangeReminderMinutesBefore: (v: number | null) => void;
  reminderSwitchLabel: string;
  reminderHint: string;
  /** Texto ya interpolado (ej. t(..., { minutes })). */
  reminderMinutesSummary: string;
  weekStartDate?: string;
  weekEndDate?: string;
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
  primaryButtonLabel,
  doctorMaxLength,
  notesMaxLength,
  reminderMinutesBefore,
  onChangeReminderMinutesBefore,
  reminderSwitchLabel,
  reminderHint,
  reminderMinutesSummary,
  weekStartDate,
  weekEndDate,
}: AppointmentCreateModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const defaultStyles = useDefaultStyles();
  const [segment, setSegment] = useState<PickerSegment>('date');

  useEffect(() => {
    if (visible) setSegment('date');
  }, [visible]);

  const pickerDate = appointmentDateTime ? parseLocalWallDateTime(appointmentDateTime).toDate() : new Date();

  const reminderEnabled = reminderMinutesBefore !== null;
  const minutes = reminderMinutesBefore ?? CONTENT_LIMITS.appointmentReminderMinutesDefault;

  const bumpReminder = (delta: number) => {
    const next = Math.round(minutes / CONTENT_LIMITS.appointmentReminderMinutesStep) * CONTENT_LIMITS.appointmentReminderMinutesStep + delta;
    const clamped = Math.min(
      CONTENT_LIMITS.appointmentReminderMinutesMax,
      Math.max(CONTENT_LIMITS.appointmentReminderMinutesMin, next)
    );
    onChangeReminderMinutesBefore(clamped);
  };

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

  const renderDay = useCallback((day: CalendarDay) => {
    const inRange =
      weekStartDate && weekEndDate
        ? !dayjs(day.date).isBefore(weekStartDate, 'day') && !dayjs(day.date).isAfter(weekEndDate, 'day')
        : false;
    const textColor = day.isSelected
      ? colors.white
      : inRange
        ? colors.primary
        : day.isToday
          ? colors.primary
          : day.isCurrentMonth
            ? colors.textMuted
            : colors.iconMuted;
    const fontWeight = inRange || day.isSelected ? ('700' as const) : ('400' as const);
    return (
      <>
        {inRange && !day.isSelected && (
          <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, backgroundColor: colors.primarySoft, borderRadius: 8 }} />
        )}
        <Text style={{ color: textColor, fontWeight, fontSize: 14 }}>{day.text}</Text>
      </>
    );
  }, [weekStartDate, weekEndDate]);

  const applyDatePart = (picked: DateType) => {
    if (picked == null) {
      onChangeAppointmentDateTime(undefined);
      return;
    }
    const p = dayjs(picked);
    const base = appointmentDateTime ? parseLocalWallDateTime(appointmentDateTime) : dayjs();
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
    const base = appointmentDateTime ? parseLocalWallDateTime(appointmentDateTime) : dayjs();
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
                    components={{ Day: renderDay }}
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

              <View className="mt-2 mb-4">
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-[15px] font-semibold text-text-primary flex-1 pr-3">{reminderSwitchLabel}</Text>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={(on) =>
                      onChangeReminderMinutesBefore(
                        on ? CONTENT_LIMITS.appointmentReminderMinutesDefault : null
                      )
                    }
                    disabled={submitting}
                    trackColor={{ false: colors.surfaceMuted, true: colors.primarySoft }}
                    thumbColor={reminderEnabled ? colors.primary : colors.iconMuted}
                  />
                </View>
                {reminderEnabled ? (
                  <>
                    <Text className="text-[12px] text-text-muted mb-2">{reminderHint}</Text>
                    <View className="flex-row items-center justify-between bg-card-subtle rounded-[12px] border border-border px-3 py-3">
                      <Pressable
                        onPress={() => bumpReminder(-CONTENT_LIMITS.appointmentReminderMinutesStep)}
                        disabled={submitting || minutes <= CONTENT_LIMITS.appointmentReminderMinutesMin}
                        className="w-11 h-11 rounded-full bg-primary items-center justify-center active:opacity-80 disabled:opacity-40"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text className="text-white text-[20px] font-bold">−</Text>
                      </Pressable>
                      <Text className="text-[15px] font-semibold text-text-primary text-center flex-1 px-2">
                        {reminderMinutesSummary}
                      </Text>
                      <Pressable
                        onPress={() => bumpReminder(CONTENT_LIMITS.appointmentReminderMinutesStep)}
                        disabled={submitting || minutes >= CONTENT_LIMITS.appointmentReminderMinutesMax}
                        className="w-11 h-11 rounded-full bg-primary items-center justify-center active:opacity-80 disabled:opacity-40"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text className="text-white text-[20px] font-bold">+</Text>
                      </Pressable>
                    </View>
                  </>
                ) : null}
              </View>

              <TextInput
                className="bg-card-subtle rounded-[10px] px-[14px] py-3 text-[15px] border border-border text-text-primary mb-2"
                placeholder={doctorPlaceholder}
                placeholderTextColor={colors.textPlaceholder}
                value={doctor}
                onChangeText={onChangeDoctor}
                editable={!submitting}
                maxLength={doctorMaxLength}
              />
              <CharacterLimitNotice currentLength={doctor.length} maxLength={doctorMaxLength} className="mb-2" />
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
                maxLength={notesMaxLength}
                inputAccessoryViewID={
                  Platform.OS === 'ios' ? INPUT_ACCESSORY_IDS.appointmentNotes : undefined
                }
              />
              <CharacterLimitNotice currentLength={notes.length} maxLength={notesMaxLength} className="mb-2" />
              <Pressable
                className={`bg-primary rounded-[12px] py-4 items-center mt-1 flex-row justify-center gap-2 ${submitting ? 'opacity-90' : ''}`}
                onPress={submitting ? undefined : dismissKeyboardAndSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text className="text-white text-[17px] font-semibold">
                    {primaryButtonLabel ?? addLabel}
                  </Text>
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
