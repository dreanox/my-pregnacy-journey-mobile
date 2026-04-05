import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FontAwesome from '@expo/vector-icons/FontAwesome';

import { colors } from '@/lib/theme';

type CharacterLimitNoticeProps = {
  currentLength: number;
  maxLength: number | undefined;
  /** Extra container classes (NativeWind). */
  className?: string;
};

/** Shown when the user has reached `maxLength` (input is typically capped; this explains why typing stopped). */
export function CharacterLimitNotice({ currentLength, maxLength, className }: CharacterLimitNoticeProps) {
  const { t } = useTranslation();
  if (maxLength == null || maxLength <= 0 || currentLength < maxLength) {
    return null;
  }

  return (
    <View className={`flex-row items-start gap-2 px-1 ${className ?? ''}`}>
      <FontAwesome name="info-circle" size={14} color={colors.primary} style={{ marginTop: 2 }} />
      <Text className="text-[13px] text-primary font-medium flex-1 leading-[18px]">
        {t('common.characterLimitReached', { max: maxLength })}
      </Text>
    </View>
  );
}
