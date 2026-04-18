import { useRef } from 'react';
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
import dayjs from 'dayjs';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
  insertDateLabel: string;
  locale: string;
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
  insertDateLabel,
  locale,
}: NoteEditorModalProps) {
  const insets = useSafeAreaInsets();
  const noteEditorMinHeight = Math.max(320, Dimensions.get('window').height * 0.65);
  const modalInsetTop =
    insets.top > 0 ? insets.top : Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  const inputRef = useRef<TextInput>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const handleInsertDate = () => {
    const fmt = locale.startsWith('es') ? 'DD/MM/YYYY HH:mm' : 'MM/DD/YYYY HH:mm';
    const dateStr = dayjs().format(fmt);
    const { start, end } = selectionRef.current;
    const newText = draft.slice(0, start) + dateStr + draft.slice(end);
    onChangeDraft(newText);
    const newPos = start + dateStr.length;
    setTimeout(() => {
      inputRef.current?.setNativeProps({ selection: { start: newPos, end: newPos } });
    }, 10);
  };

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

          <View className="px-4 py-2 border-b border-border flex-row">
            <Pressable
              onPress={handleInsertDate}
              className="flex-row items-center gap-1.5 bg-primary-soft px-3 py-1.5 rounded-full active:opacity-70"
            >
              <FontAwesome name="calendar-o" size={13} color={colors.primary} />
              <Text className="text-[13px] font-semibold text-primary">{insertDateLabel}</Text>
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="grow pb-6"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <TextInput
              ref={inputRef}
              className="px-4 py-4 text-[16px] text-text-primary"
              style={{ minHeight: noteEditorMinHeight, textAlignVertical: 'top' }}
              multiline
              placeholder={mode === 'add' ? placeholder : undefined}
              placeholderTextColor={colors.textPlaceholder}
              value={draft}
              onChangeText={onChangeDraft}
              maxLength={maxLength}
              onSelectionChange={(e) => { selectionRef.current = e.nativeEvent.selection; }}
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
