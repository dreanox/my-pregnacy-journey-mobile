import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MedicationEditorModal } from '@/components/modals/MedicationEditorModal';
import { useInvalidateWeekEntry } from '@/hooks/useInvalidateWeekEntry';
import { showError } from '@/lib/errorHelper';
import {
  deleteMedication,
  postMedication,
  putMedication,
} from '@/lib/services/weekEntry';
import type { Medication, WeekEntry } from '@/lib/types';
import { colors } from '@/lib/theme';
import { parseMedicationDosage } from '@/lib/validators/health';

export type MedicationsSectionProps = {
  entry: WeekEntry;
  weekEntryRouteId: string;
};

export function MedicationsSection({ entry, weekEntryRouteId }: MedicationsSectionProps) {
  const { t } = useTranslation();
  const invalidate = useInvalidateWeekEntry(weekEntryRouteId);
  const [medModalVisible, setMedModalVisible] = useState(false);
  const [medModalMode, setMedModalMode] = useState<'add' | 'edit'>('add');
  const [editingMedId, setEditingMedId] = useState<number | null>(null);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medNameTouched, setMedNameTouched] = useState(false);
  const [medDosageTouched, setMedDosageTouched] = useState(false);
  const [medSaveAttempted, setMedSaveAttempted] = useState(false);

  const dosageParsed = parseMedicationDosage(medDosage);
  const showMedNameError = !medName.trim() && (medNameTouched || medSaveAttempted);
  const showMedDosageError =
    medDosage.trim() !== '' && !dosageParsed.ok && (medDosageTouched || medSaveAttempted);
  const showMedDosageCheck = medDosage.trim() !== '' && dosageParsed.ok;

  const closeMedModal = () => {
    setMedModalVisible(false);
    setEditingMedId(null);
    setMedName('');
    setMedDosage('');
    setMedNameTouched(false);
    setMedDosageTouched(false);
    setMedSaveAttempted(false);
  };

  const openAddMed = () => {
    setMedModalMode('add');
    setEditingMedId(null);
    setMedName('');
    setMedDosage('');
    setMedNameTouched(false);
    setMedDosageTouched(false);
    setMedSaveAttempted(false);
    setMedModalVisible(true);
  };

  const openEditMed = (m: Medication) => {
    setMedModalMode('edit');
    setEditingMedId(m.id);
    setMedName(m.name);
    setMedDosage(m.dosage ?? '');
    setMedNameTouched(false);
    setMedDosageTouched(false);
    setMedSaveAttempted(false);
    setMedModalVisible(true);
  };

  const addMed = useMutation({
    mutationFn: (payload: { name: string; dosage: number | null }) =>
      postMedication(entry.id, {
        name: payload.name,
        dosage: payload.dosage !== null ? String(payload.dosage) : null,
      }),
    onSuccess: () => {
      invalidate();
      closeMedModal();
    },
    onError: (e) => showError(t('common.error'), e, t('week.medicationSaveFailed')),
  });

  const updateMed = useMutation({
    mutationFn: (payload: { medId: number; name: string; dosage: number | null }) =>
      putMedication(entry.id, payload.medId, {
        name: payload.name,
        dosage: payload.dosage !== null ? String(payload.dosage) : null,
      }),
    onSuccess: () => {
      invalidate();
      closeMedModal();
    },
    onError: (e) => showError(t('common.error'), e, t('week.medicationSaveFailed')),
  });

  const deleteMed = useMutation({
    mutationFn: (medId: number) => deleteMedication(entry.id, medId),
    onSuccess: () => invalidate(),
  });

  const savingMed = addMed.isPending || updateMed.isPending;

  const submitMed = () => {
    setMedSaveAttempted(true);
    if (!medName.trim()) return;
    if (medDosage.trim() !== '' && !dosageParsed.ok) return;

    const dosageValue = dosageParsed.ok ? dosageParsed.value : null;
    const body = { name: medName.trim(), dosage: dosageValue };

    if (medModalMode === 'edit' && editingMedId != null) {
      updateMed.mutate({ medId: editingMedId, ...body });
    } else {
      addMed.mutate(body);
    }
  };

  return (
    <View className="bg-card rounded-[14px] p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-3 min-w-0 shrink">
          <Text className="text-[17px] font-bold text-text-primary" numberOfLines={2}>
            <FontAwesome name="medkit" size={16} /> {t('week.medications')}
          </Text>
        </View>
        <Pressable onPress={openAddMed} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} className="p-1">
          <FontAwesome name="plus-circle" size={20} color={colors.primary} />
        </Pressable>
      </View>
      {entry.medications?.map((m) => (
        <View key={m.id} className="flex-row items-center py-2.5 border-b border-b-surface-muted">
          <Pressable
            className="flex-1 flex-row items-center min-w-0 pr-2 active:opacity-80"
            onPress={() => openEditMed(m)}
          >
            <View className="flex-1 min-w-0">
              <Text className="text-[15px] font-semibold text-text-primary">{m.name}</Text>
              {m.dosage != null && m.dosage !== '' && (
                <Text className="text-[13px] text-text-muted mt-0.5">{m.dosage}</Text>
              )}
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
              Alert.alert(t('week.deleteMedicationTitle'), t('week.deleteMedicationMessage'), [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('common.delete'),
                  style: 'destructive',
                  onPress: () => deleteMed.mutate(m.id),
                },
              ])
            }
            className="w-11 items-center justify-center py-2 pl-2"
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <FontAwesome name="trash-o" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
      {!entry.medications?.length && <Text className="text-[15px] text-text-muted">{t('week.noMedications')}</Text>}

      <MedicationEditorModal
        visible={medModalVisible}
        mode={medModalMode}
        titleAdd={t('week.addMedication')}
        titleEdit={t('week.editMedication')}
        medName={medName}
        medDosage={medDosage}
        showMedNameError={showMedNameError}
        showMedDosageError={showMedDosageError}
        showMedDosageCheck={showMedDosageCheck}
        onChangeName={(v) => {
          setMedName(v);
          setMedNameTouched(true);
        }}
        onChangeDosage={(v) => {
          setMedDosage(v);
          setMedDosageTouched(true);
        }}
        onSubmit={submitMed}
        onClose={closeMedModal}
        saving={savingMed}
        medicationNamePlaceholder={t('week.medicationName')}
        dosagePlaceholder={t('week.dosagePlaceholder')}
        medicationNameRequired={t('week.medicationNameRequired')}
        dosageOutOfRange={t('week.dosageOutOfRange')}
        addLabel={t('common.add')}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      />
    </View>
  );
}
