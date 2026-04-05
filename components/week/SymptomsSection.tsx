import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CharacterLimitNotice } from '@/components/CharacterLimitNotice';
import { useInvalidateWeekEntry } from '@/hooks/useInvalidateWeekEntry';
import { CONTENT_LIMITS } from '@/lib/constants/contentLimits';
import { showError } from '@/lib/errorHelper';
import { putWeekEntrySymptoms } from '@/lib/services/weekEntry';
import { DEFAULT_SYMPTOMS, SYMPTOM_I18N_KEYS } from '@/lib/types';
import type { WeekEntry } from '@/lib/types';
import { colors } from '@/lib/theme';
import { isPresetSymptom } from '@/lib/utils/symptoms';

export type SymptomsSectionProps = {
  entry: WeekEntry;
  weekEntryRouteId: string;
  readOnly?: boolean;
};

export function SymptomsSection({ entry, weekEntryRouteId, readOnly = false }: SymptomsSectionProps) {
  const { t } = useTranslation();
  const invalidate = useInvalidateWeekEntry(weekEntryRouteId);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(entry.symptoms?.map((s) => s.name) ?? [])
  );
  const [custom, setCustom] = useState('');

  const symptomLabel = (name: string) =>
    SYMPTOM_I18N_KEYS[name] ? t(SYMPTOM_I18N_KEYS[name]) : name;

  const sync = useMutation({
    mutationFn: () => {
      const symptoms = Array.from(selected).map((name) => ({
        name,
        is_custom: !isPresetSymptom(name),
      }));
      return putWeekEntrySymptoms(entry.id, symptoms);
    },
    onSuccess: () => {
      invalidate();
      setEditing(false);
    },
    onError: (e) => showError(t('common.error'), e, t('week.symptomSyncFailed')),
  });

  const toggleSymptom = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const addCustom = () => {
    const name = custom.trim();
    if (!name) return;
    if (name.length > CONTENT_LIMITS.customSymptomNameMax) return;
    setSelected((prev) => new Set(prev).add(name));
    setCustom('');
  };

  return (
    <View className="bg-card rounded-[14px] p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-3 min-w-0 shrink">
          <Text className="text-[17px] font-bold text-text-primary" numberOfLines={2}>
            <FontAwesome name="heartbeat" size={16} /> {t('week.symptoms')}
          </Text>
        </View>
        {!readOnly && !editing ? (
          <Pressable onPress={() => setEditing(true)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} className="p-1">
            <FontAwesome name="pencil" size={16} color={colors.primary} />
          </Pressable>
        ) : !readOnly && editing ? (
          <Pressable
            onPress={() => sync.mutate()}
            disabled={sync.isPending}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className={`px-2 py-1 min-w-[56px] items-center justify-center ${sync.isPending ? 'opacity-70' : ''}`}
          >
            {sync.isPending ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text className="text-primary font-semibold">{t('common.done')}</Text>
            )}
          </Pressable>
        ) : null}
      </View>
      {editing && !readOnly ? (
        <View style={{ gap: 20 }}>
          <View className="flex-row flex-wrap gap-2">
            {DEFAULT_SYMPTOMS.map((s) => (
              <Pressable
                key={s}
                className={`px-[14px] py-2 rounded-[20px] border ${selected.has(s) ? 'bg-primary-soft border-primary' : 'bg-surface-muted border-border-strong'}`}
                onPress={() => toggleSymptom(s)}
              >
                <Text className={`text-[13px] ${selected.has(s) ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                  {symptomLabel(s)}
                </Text>
              </Pressable>
            ))}
            {Array.from(selected)
              .filter((s) => !isPresetSymptom(s))
              .map((s) => (
                <Pressable
                  key={s}
                  className="px-[14px] py-2 rounded-[20px] border bg-primary-soft border-primary"
                  onPress={() => toggleSymptom(s)}
                >
                  <Text className="text-[13px] text-primary font-semibold">{symptomLabel(s)}</Text>
                </Pressable>
              ))}
          </View>
          <View>
            <View className="flex-row items-end gap-2">
              <TextInput
                className="flex-1 bg-card-subtle rounded-[10px] px-[14px] py-3 text-[15px] border border-border text-text-primary min-h-[48px]"
                value={custom}
                onChangeText={setCustom}
                placeholder={t('week.addCustomSymptom')}
                placeholderTextColor={colors.textPlaceholder}
                maxLength={CONTENT_LIMITS.customSymptomNameMax}
              />
              <Pressable className="bg-primary rounded-[10px] px-4 py-3" onPress={addCustom}>
                <Text className="text-white font-semibold text-[14px]">{t('common.add')}</Text>
              </Pressable>
            </View>
            <CharacterLimitNotice
              currentLength={custom.length}
              maxLength={CONTENT_LIMITS.customSymptomNameMax}
              className="mt-2"
            />
          </View>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {entry.symptoms?.length ? (
            entry.symptoms.map((s) => (
              <View key={s.id} className="px-[14px] py-2 rounded-[20px] border bg-primary-soft border-primary">
                <Text className="text-[13px] text-primary font-semibold">{symptomLabel(s.name)}</Text>
              </View>
            ))
          ) : (
            <Text className="text-[15px] text-text-muted">{t('week.noSymptoms')}</Text>
          )}
        </View>
      )}
    </View>
  );
}
