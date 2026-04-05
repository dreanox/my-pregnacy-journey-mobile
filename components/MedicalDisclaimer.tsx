import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/lib/theme';

type Props = {
  className?: string;
  /** `banner`: caja con icono. `inline`: solo texto (p. ej. pies de lista). */
  variant?: 'banner' | 'inline';
};

export function MedicalDisclaimer({ className = '', variant = 'banner' }: Props) {
  const { t } = useTranslation();
  if (variant === 'inline') {
    return (
      <Text className={`text-[12px] text-text-muted text-center leading-[18px] ${className}`}>
        {t('medical.notSubstitute')}
      </Text>
    );
  }
  return (
    <View className={`flex-row items-start gap-2 rounded-[12px] border border-border bg-primary-soft px-3 py-2.5 ${className}`}>
      <FontAwesome name="info-circle" size={14} color={colors.primary} style={{ marginTop: 2 }} />
      <Text className="flex-1 text-[12px] text-text-secondary leading-[18px] font-medium">
        {t('medical.notSubstitute')}
      </Text>
    </View>
  );
}
