import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/lib/theme';

export type FullScreenPhotoModalProps = {
  visible: boolean;
  photoUri: string | null;
  /** e.g. localized "W12" / "S12" */
  weekBadge: string;
  onClose: () => void;
  /** Opens confirm flow (caller shows Alert + mutate). */
  onDeletePress: () => void;
  deleting: boolean;
  closeAccessibilityLabel: string;
  deleteAccessibilityLabel: string;
};

export function FullScreenPhotoModal({
  visible,
  photoUri,
  weekBadge,
  onClose,
  onDeletePress,
  deleting,
  closeAccessibilityLabel,
  deleteAccessibilityLabel,
}: FullScreenPhotoModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined}
      onRequestClose={deleting ? undefined : onClose}
    >
      <View className="flex-1 bg-black">
        <View
          className="flex-row justify-between items-center px-3 pb-2"
          style={{ paddingTop: Math.max(insets.top, 12) }}
        >
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel={closeAccessibilityLabel}
          >
            <FontAwesome name="times" size={28} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={onDeletePress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel={deleteAccessibilityLabel}
          >
            {deleting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <FontAwesome name="trash-o" size={26} color={colors.white} />
            )}
          </Pressable>
        </View>

        <View className="flex-1 justify-center items-center">
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              className="w-full flex-1"
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </View>

        {weekBadge ? (
          <View className="px-4 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
            <Text className="text-white text-center text-[15px] font-semibold">{weekBadge}</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
