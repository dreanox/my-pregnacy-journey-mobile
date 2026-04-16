import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { useAuth } from '@/lib/auth';
import { showTestApiConnection } from '@/lib/featureFlags';
import { testConnection } from '@/lib/services/connectionApi';
import { useActivePregnancy } from '@/hooks/useActivePregnancy';
import { STORAGE_KEYS } from '@/lib/constants/storageKeys';
import { showError } from '@/lib/errorHelper';
import i18n from '@/lib/i18n';
import { queryKeys } from '@/lib/queryKeys';
import { postRequestAccountDeletion } from '@/lib/services/authApi';
import { updatePregnancy } from '@/lib/services/weekEntry';
import { colors } from '@/lib/theme';

const LANGUAGES = [
  { code: 'es' as const, labelKey: 'profile.languageSpanish' },
  { code: 'en' as const, labelKey: 'profile.languageEnglish' },
];

export default function ProfileSettingsScreen() {
  const { t, i18n: i18nInstance } = useTranslation();
  const router = useRouter();
  const qc = useQueryClient();
  const { clearLocalSession, user } = useAuth();
  const [savingLang, setSavingLang] = useState<string | null>(null);
  const [testingApi, setTestingApi] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const pregnancyQuery = useActivePregnancy();
  const activePregnancy = pregnancyQuery.data?.find((p) => p.is_active);

  const deleteAccount = useMutation({
    mutationFn: (password: string) => postRequestAccountDeletion(password),
    onSuccess: async () => {
      setShowDeleteAccount(false);
      setDeletePassword('');
      qc.clear();
      await clearLocalSession();
      Alert.alert(t('profile.deleteAccountSuccessTitle'), t('profile.deleteAccountSuccessMessage'), [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    },
    onError: (e) => showError(t('common.error'), e, t('profile.deleteAccountFailed')),
  });

  const endPregnancy = useMutation({
    mutationFn: (pregnancyId: number) => updatePregnancy(pregnancyId, { is_active: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pregnancies.all });
      qc.invalidateQueries({ queryKey: queryKeys.weekEntries.all });
      qc.invalidateQueries({ queryKey: queryKeys.appointments.upcoming });
      qc.invalidateQueries({ queryKey: queryKeys.gallery.all });
      qc.invalidateQueries({ queryKey: queryKeys.weekEntry.all });
      router.replace('/');
    },
    onError: (e) => showError(t('common.error'), e, t('profile.endPregnancyFailed')),
  });

  const confirmEndPregnancy = () => {
    if (!activePregnancy || endPregnancy.isPending) return;
    Alert.alert(t('profile.endPregnancyConfirmTitle'), t('profile.endPregnancyConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.endPregnancyConfirmButton'),
        style: 'destructive',
        onPress: () => endPregnancy.mutate(activePregnancy.id),
      },
    ]);
  };

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

      {showTestApiConnection(user) ? (
        <>
          <Text className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
            {t('profile.settingsDeveloperSection')}
          </Text>
          <View className="bg-card rounded-[14px] border border-border overflow-hidden mb-6">
            <Pressable
              onPress={async () => {
                setTestingApi(true);
                const result = await testConnection();
                setTestingApi(false);
                const titles = { ok: 'API OK', warning: 'API Warning', error: 'API Error' };
                Alert.alert(titles[result.status], result.detail);
              }}
              disabled={testingApi}
              className={`flex-row items-center justify-center gap-2 py-3.5 px-4 ${testingApi ? 'opacity-60' : 'active:opacity-90'}`}
            >
              {testingApi ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <FontAwesome name="plug" size={18} color={colors.primary} />
                  <Text className="text-[16px] font-semibold text-primary">{t('profile.testApiConnection')}</Text>
                </>
              )}
            </Pressable>
            {(user?.is_developer || (user?.feature_flags && Object.keys(user.feature_flags).length > 0)) && (
              <View className="border-t border-border px-3 py-3 bg-surface-muted/50">
                <Text className="text-[11px] text-text-muted mb-1">{t('profile.developerFlagsSnapshot')}</Text>
                <Text className="text-[10px] text-text-secondary font-mono" selectable>
                  {JSON.stringify(
                    { is_developer: user?.is_developer ?? false, feature_flags: user?.feature_flags ?? null },
                    null,
                    2
                  )}
                </Text>
              </View>
            )}
          </View>
        </>
      ) : null}

      <Text className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
        {t('profile.settingsDataSection')}
      </Text>
      <View className="bg-card rounded-[14px] border border-border p-4 mb-3">
        <Text className="text-[14px] text-text-secondary leading-5">{t('profile.settingsDataHint')}</Text>
      </View>
      <MedicalDisclaimer className="mb-6" />

      {activePregnancy ? (
        <>
          <Text className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
            {t('profile.settingsPregnancySection')}
          </Text>
          <View className="bg-card rounded-[14px] border border-border p-4 mb-6">
            <Text className="text-[14px] text-text-secondary leading-5 mb-4">{t('profile.endPregnancyHint')}</Text>
            <Pressable
              onPress={confirmEndPregnancy}
              disabled={endPregnancy.isPending}
              className={`border border-primary rounded-[12px] py-3.5 px-4 items-center active:opacity-90 ${endPregnancy.isPending ? 'opacity-60' : ''}`}
            >
              {endPregnancy.isPending ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text className="text-[16px] font-semibold text-primary">{t('profile.endPregnancy')}</Text>
              )}
            </Pressable>
          </View>
        </>
      ) : null}

      <Text className="mb-[8px] mt-[8px] text-[13px] font-semibold uppercase tracking-wide text-text-muted">
        {t('profile.deleteAccountSection')}
      </Text>
      <View className="mb-6 rounded-[14px] border border-red-200 bg-red-50/80 p-4">
        <Text className="mb-3 text-[14px] leading-[21px] text-text-secondary">{t('profile.deleteAccountIntro')}</Text>
        <Pressable
          onPress={() => {
            setDeletePassword('');
            setShowDeleteAccount(true);
          }}
          className="rounded-[12px] border border-red-400 bg-white py-3.5 px-4 items-center active:opacity-90"
        >
          <Text className="text-[16px] font-semibold text-red-600">{t('profile.deleteAccountTitle')}</Text>
        </Pressable>
      </View>

      <Modal visible={showDeleteAccount} transparent animationType="fade" onRequestClose={() => !deleteAccount.isPending && setShowDeleteAccount(false)}>
        <KeyboardAvoidingView
          className="flex-1 justify-center bg-overlay px-4"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="max-h-[85%] rounded-[16px] border border-border bg-card p-5">
            <Text className="mb-3 text-[18px] font-bold text-text-primary">{t('profile.deleteAccountTitle')}</Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text className="mb-4 text-[14px] leading-[22px] text-text-primary">{t('profile.deleteAccountLegalNotice')}</Text>
              <Text className="mb-2 text-[13px] font-medium text-text-secondary">{t('profile.deleteAccountPasswordHint')}</Text>
              <TextInput
                className="mb-4 rounded-[12px] border border-border bg-white px-[14px] py-[12px] text-[16px] text-text-primary"
                placeholder={t('profile.deleteAccountPasswordPlaceholder')}
                placeholderTextColor={colors.textPlaceholder}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!deleteAccount.isPending}
              />
            </ScrollView>
            <View className="mt-2 flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-[12px] border border-border py-3.5 active:opacity-90"
                onPress={() => !deleteAccount.isPending && setShowDeleteAccount(false)}
                disabled={deleteAccount.isPending}
              >
                <Text className="text-[16px] font-semibold text-text-primary">{t('profile.deleteAccountCancel')}</Text>
              </Pressable>
              <Pressable
                className={`flex-1 items-center rounded-[12px] bg-red-600 py-3.5 ${!deletePassword.trim() || deleteAccount.isPending ? 'opacity-50' : ''}`}
                onPress={() => deleteAccount.mutate(deletePassword)}
                disabled={!deletePassword.trim() || deleteAccount.isPending}
              >
                {deleteAccount.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text className="text-[16px] font-semibold text-white">{t('profile.deleteAccountConfirm')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
