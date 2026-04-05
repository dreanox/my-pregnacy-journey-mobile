import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterLimitNotice } from '@/components/CharacterLimitNotice';
import { colors } from '@/lib/theme';

export type NoteEditorModalProps = {
  visible: boolean;
  mode: 'add' | 'edit';
  titleAdd: string;
  titleEdit: string;
  draft: string;
  onChangeDraft: (text: string) => void;
  placeholder?: string;
  /** When set, input is capped and a character counter is shown. */
  maxLength?: number;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  canSave: boolean;
  cancelLabel: string;
  saveLabel: string;
};

export function NoteEditorModal({
  visible,
  mode,
  titleAdd,
  titleEdit,
  draft,
  onChangeDraft,
  placeholder,
  maxLength,
  onClose,
  onSave,
  saving,
  canSave,
  cancelLabel,
  saveLabel,
}: NoteEditorModalProps) {
  const insets = useSafeAreaInsets();
  const noteEditorMinHeight = Math.max(320, Dimensions.get('window').height * 0.65);
  const modalInsetTop =
    insets.top > 0 ? insets.top : Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-card"
        style={{
          paddingTop: modalInsetTop,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <Pressable onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} className="py-2 pr-4">
              <Text className="text-[16px] text-text-secondary">{cancelLabel}</Text>
            </Pressable>
            <Text className="text-[17px] font-bold text-text-primary">
              {mode === 'add' ? titleAdd : titleEdit}
            </Text>
            <Pressable
              onPress={onSave}
              disabled={saving || !canSave}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className={`py-2 pl-4 ${!canSave && !saving ? 'opacity-40' : ''}`}
            >
              {saving ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text className="text-[16px] font-semibold text-primary">{saveLabel}</Text>
              )}
            </Pressable>
          </View>
          <ScrollView
            className="flex-1"
            contentContainerClassName="grow pb-6"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <TextInput
              className="px-4 py-4 text-[16px] text-text-primary"
              style={{ minHeight: noteEditorMinHeight, textAlignVertical: 'top' }}
              multiline
              placeholder={mode === 'add' ? placeholder : undefined}
              placeholderTextColor={colors.textPlaceholder}
              value={draft}
              onChangeText={onChangeDraft}
              maxLength={maxLength}
            />
            {maxLength != null ? (
              <View className="px-4 pb-2">
                <Text className="text-[12px] text-text-muted text-right mb-1">
                  {draft.length}/{maxLength}
                </Text>
                <CharacterLimitNotice currentLength={draft.length} maxLength={maxLength} />
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
