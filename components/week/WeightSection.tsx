import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useInvalidateWeekEntry } from '@/hooks/useInvalidateWeekEntry';
import { showError } from '@/lib/errorHelper';
import { updateWeekEntryWeight } from '@/lib/services/weekEntry';
import type { WeekEntry } from '@/lib/types';
import { colors } from '@/lib/theme';
import { parseWeightInput } from '@/lib/validators/health';

export type WeightSectionProps = {
  entry: WeekEntry;
  weekEntryRouteId: string;
  pregnancyId: number;
  readOnly?: boolean;
};

export function WeightSection({ entry, weekEntryRouteId, pregnancyId, readOnly = false }: WeightSectionProps) {
  const { t } = useTranslation();
  const invalidate = useInvalidateWeekEntry(weekEntryRouteId);
  const [weight, setWeight] = useState(entry.weight?.toString() ?? '');
  const [editing, setEditing] = useState(false);
  const [weightTouched, setWeightTouched] = useState(false);

  useEffect(() => {
    if (!editing) {
      setWeight(entry.weight?.toString() ?? '');
    }
  }, [entry.weight, entry.id, editing]);

  const parsed = parseWeightInput(weight);
  const weightInputValid = parsed.ok;
  const showWeightError = editing && weightTouched && !weightInputValid;
  const showWeightCheck =
    editing && weightTouched && weightInputValid && weight.trim() !== '';

  const save = useMutation({
    mutationFn: (value: number | null) =>
      updateWeekEntryWeight(pregnancyId, weekEntryRouteId, value),
    onSuccess: () => {
      invalidate();
      setEditing(false);
      setWeightTouched(false);
    },
    onError: (e) => {
      showError(t('common.error'), e, t('week.weightSaveFailed'));
    },
  });

  const hitSlop = { top: 12, bottom: 12, left: 12, right: 12 } as const;

  const openWeightEdit = () => {
    setWeight(entry.weight?.toString() ?? '');
    setWeightTouched(false);
    setEditing(true);
  };

  const handleSaveWeight = () => {
    const result = parseWeightInput(weight);
    if (!result.ok) {
      setWeightTouched(true);
      return;
    }
    save.mutate(result.value);
  };

  return (
    <View className="bg-card rounded-[14px] p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-3 min-w-0 shrink">
          <Text className="text-[17px] font-bold text-text-primary" numberOfLines={2}>
            <FontAwesome name="balance-scale" size={16} /> {t('week.weight')}
          </Text>
        </View>
        {!readOnly && !editing && (
          <Pressable onPress={openWeightEdit} hitSlop={hitSlop} className="p-1">
            <FontAwesome name="pencil" size={16} color={colors.primary} />
          </Pressable>
        )}
      </View>
      {editing ? (
        <>
          <View
            className="flex-row items-end gap-2"
            style={{ marginBottom: showWeightError ? 4 : 0 }}
          >
            <View
              className={`flex-1 flex-row items-center bg-card-subtle rounded-[10px] border min-h-[48px] ${
                showWeightError ? 'border-primary' : 'border-border'
              }`}
            >
              <TextInput
                className="flex-1 px-[14px] py-3 text-[15px] text-text-primary"
                style={Platform.OS === 'android' ? { textAlignVertical: 'center' } : undefined}
                value={weight}
                onChangeText={(v) => {
                  setWeight(v);
                  setWeightTouched(true);
                }}
                keyboardType="decimal-pad"
                placeholder={t('week.weightPlaceholder')}
                placeholderTextColor={colors.textPlaceholder}
              />
              {showWeightCheck && (
                <FontAwesome name="check-circle" size={18} color={colors.success} style={{ paddingRight: 14 }} />
              )}
            </View>
            <Pressable
              className={`bg-primary rounded-[10px] px-4 py-3 min-h-[48px] justify-center ${save.isPending ? 'opacity-70' : ''}`}
              onPress={handleSaveWeight}
              disabled={save.isPending}
            >
              {save.isPending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text className="text-white font-semibold text-[14px]">{t('common.save')}</Text>
              )}
            </Pressable>
          </View>
          {showWeightError && (
            <View className="flex-row items-center gap-[6px] mb-[10px] px-[4px]">
              <FontAwesome name="times-circle" size={14} color={colors.primary} />
              <Text className="text-[13px] text-primary">{t('week.weightOutOfRange')}</Text>
            </View>
          )}
        </>
      ) : (
        <Text className="text-[15px] text-text-muted">
          {entry.weight ? t('week.weightDisplay', { value: entry.weight }) : t('week.notRecorded')}
        </Text>
      )}
    </View>
  );
}
