import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  ActivityIndicator,
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

import { CharacterLimitNotice } from '@/components/CharacterLimitNotice';
import { colors } from '@/lib/theme';

export type MedicationEditorModalProps = {
  visible: boolean;
  mode: 'add' | 'edit';
  titleAdd: string;
  titleEdit: string;
  medName: string;
  medDosage: string;
  showMedNameError: boolean;
  showMedDosageError: boolean;
  showMedDosageCheck: boolean;
  onChangeName: (v: string) => void;
  onChangeDosage: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  saving: boolean;
  medicationNamePlaceholder: string;
  dosagePlaceholder: string;
  medicationNameRequired: string;
  dosageOutOfRange: string;
  addLabel: string;
  saveLabel: string;
  cancelLabel: string;
  nameMaxLength?: number;
};

export function MedicationEditorModal({
  visible,
  mode,
  titleAdd,
  titleEdit,
  medName,
  medDosage,
  showMedNameError,
  showMedDosageError,
  showMedDosageCheck,
  onChangeName,
  onChangeDosage,
  onSubmit,
  onClose,
  saving,
  medicationNamePlaceholder,
  dosagePlaceholder,
  medicationNameRequired,
  dosageOutOfRange,
  addLabel,
  saveLabel,
  cancelLabel,
  nameMaxLength,
}: MedicationEditorModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-overlay" onPress={onClose} />
          <View
            className="bg-card rounded-t-[24px] px-6 pt-6"
            style={{ paddingBottom: Math.max(insets.bottom, 20) + 16 }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text className="text-[22px] font-bold text-text-primary mb-5">
                {mode === 'add' ? titleAdd : titleEdit}
              </Text>
              <View style={{ marginBottom: showMedNameError ? 4 : 0 }}>
                <TextInput
                  className={`bg-card-subtle rounded-[10px] px-[14px] py-3 text-[15px] border text-text-primary ${
                    showMedNameError ? 'border-primary' : 'border-border'
                  }`}
                  style={Platform.OS === 'android' ? { textAlignVertical: 'center' } : undefined}
                  placeholder={medicationNamePlaceholder}
                  placeholderTextColor={colors.textPlaceholder}
                  value={medName}
                  onChangeText={onChangeName}
                  maxLength={nameMaxLength}
                />
              </View>
              <CharacterLimitNotice currentLength={medName.length} maxLength={nameMaxLength} className="mb-1" />
              {showMedNameError && (
                <View className="flex-row items-center gap-[6px] mb-[10px] px-[4px]">
                  <FontAwesome name="times-circle" size={14} color={colors.primary} />
                  <Text className="text-[13px] text-primary">{medicationNameRequired}</Text>
                </View>
              )}
              <View
                className={`flex-row items-center bg-card-subtle rounded-[10px] border min-h-[48px] ${
                  showMedDosageError ? 'border-primary mb-1' : 'border-border mb-2'
                }`}
              >
                <TextInput
                  className="flex-1 px-[14px] py-3 text-[15px] text-text-primary"
                  style={Platform.OS === 'android' ? { textAlignVertical: 'center' } : undefined}
                  placeholder={dosagePlaceholder}
                  placeholderTextColor={colors.textPlaceholder}
                  value={medDosage}
                  onChangeText={onChangeDosage}
                  keyboardType="decimal-pad"
                />
                {showMedDosageCheck && (
                  <FontAwesome name="check-circle" size={18} color={colors.success} style={{ paddingRight: 14 }} />
                )}
              </View>
              {showMedDosageError && (
                <View className="flex-row items-center gap-[6px] mb-[10px] px-[4px]">
                  <FontAwesome name="times-circle" size={14} color={colors.primary} />
                  <Text className="text-[13px] text-primary">{dosageOutOfRange}</Text>
                </View>
              )}
              <Pressable
                className={`bg-primary rounded-[12px] py-4 items-center mt-1 ${saving ? 'opacity-70' : ''}`}
                onPress={onSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text className="text-white text-[17px] font-semibold">
                    {mode === 'add' ? addLabel : saveLabel}
                  </Text>
                )}
              </Pressable>
              <Pressable className="items-center mt-3 mb-1" onPress={onClose}>
                <Text className="text-text-secondary text-[16px]">{cancelLabel}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
