import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { STORAGE_KEYS } from '@/lib/constants/storageKeys';
import i18n from '@/lib/i18n';
import { colors } from '@/lib/theme';

const LANGUAGES = [
  { code: 'es' as const, labelKey: 'profile.languageSpanish' },
  { code: 'en' as const, labelKey: 'profile.languageEnglish' },
];

export default function ProfileSettingsScreen() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [savingLang, setSavingLang] = useState<string | null>(null);

  const setLanguage = useCallback(
    async (code: 'en' | 'es') => {
      if (i18nInstance.language?.startsWith(code)) return;
      setSavingLang(code);
      try {
        await SecureStore.setItemAsync(STORAGE_KEYS.appLanguage, code);
        await i18n.changeLanguage(code);
      } finally {
        setSavingLang(null);
      }
    },
    [i18nInstance.language]
  );

  const current = i18nInstance.language?.startsWith('es') ? 'es' : 'en';

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-5 pb-10">
      <Text className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
        {t('profile.settingsLanguageSection')}
      </Text>
      <View className="bg-card rounded-[14px] border border-border overflow-hidden mb-6">
        {LANGUAGES.map(({ code, labelKey }, i) => {
          const active = current === code;
          const busy = savingLang === code;
          const isLast = i === LANGUAGES.length - 1;
          return (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              disabled={busy}
              className={`flex-row items-center px-4 py-3.5 ${isLast ? '' : 'border-b border-border'} ${active ? 'bg-primary-soft' : ''} ${busy ? 'opacity-60' : 'active:opacity-90'}`}
            >
              <Text className={`flex-1 text-[16px] ${active ? 'font-semibold text-primary' : 'text-text-primary'}`}>
                {t(labelKey)}
              </Text>
              {busy ? (
                <Text className="text-[13px] text-text-muted">{t('profile.saving')}</Text>
              ) : active ? (
                <FontAwesome name="check" size={18} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Text className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
        {t('profile.settingsNotificationsSection')}
      </Text>
      <View className="bg-card rounded-[14px] border border-border p-4 mb-6">
        <Text className="text-[15px] text-text-primary font-medium mb-1">{t('profile.settingsNotificationsTitle')}</Text>
        <Text className="text-[14px] text-text-muted leading-5">{t('profile.settingsNotificationsHint')}</Text>
      </View>

      <Text className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
        {t('profile.settingsDataSection')}
      </Text>
      <View className="bg-card rounded-[14px] border border-border p-4">
        <Text className="text-[14px] text-text-secondary leading-5">{t('profile.settingsDataHint')}</Text>
      </View>
    </ScrollView>
  );
}
