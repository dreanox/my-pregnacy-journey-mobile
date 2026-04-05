import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export type NoteReadOnlyViewerModalProps = {
  visible: boolean;
  content: string;
  dateLabel: string;
  onClose: () => void;
};

/** Full-screen read-only note body for archived pregnancies (long text). */
export function NoteReadOnlyViewerModal({
  visible,
  content,
  dateLabel,
  onClose,
}: NoteReadOnlyViewerModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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
        <View className="flex-row items-center px-4 py-3 border-b border-border">
          <View className="w-[72px]">
            <Pressable onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} className="py-2">
              <Text className="text-[16px] font-semibold text-primary">{t('common.done')}</Text>
            </Pressable>
          </View>
          <Text className="flex-1 text-center text-[17px] font-bold text-text-primary" numberOfLines={1}>
            {t('week.readOnlyNoteTitle')}
          </Text>
          <View className="w-[72px]" />
        </View>
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-[14px] text-text-muted mb-4">{dateLabel}</Text>
          <Text selectable className="text-[18px] text-text-primary leading-[28px]">
            {content}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
