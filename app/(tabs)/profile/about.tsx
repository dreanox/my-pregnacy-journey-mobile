import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DEVELOPER_NAME, getAppVersion } from '@/lib/constants/appMetadata';

export default function ProfileAboutScreen() {
  const { t } = useTranslation();
  const version = getAppVersion();

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-5 pb-12 items-center">
      <Text className="text-[24px] font-bold text-text-primary text-center mb-1">{t('auth.appName')}</Text>
      <Text className="text-[14px] text-text-muted text-center mb-6">
        {t('profile.aboutVersion', { version })}
      </Text>

      <View className="w-full bg-card rounded-[14px] border border-border p-5 mb-5">
        <Text className="text-[16px] text-text-primary leading-6 mb-4">{t('profile.aboutDescription')}</Text>
        <Text className="text-[15px] text-text-secondary leading-5">{t('profile.aboutAudience')}</Text>
      </View>

      <Text className="text-[15px] font-semibold text-primary text-center mb-1">
        {t('profile.aboutDeveloper', { name: DEVELOPER_NAME })}
      </Text>
      <Text className="text-[13px] text-text-muted text-center">{t('profile.aboutThanks')}</Text>
    </ScrollView>
  );
}
