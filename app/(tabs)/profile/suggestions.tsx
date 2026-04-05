import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterLimitNotice } from '@/components/CharacterLimitNotice';
import { CONTENT_LIMITS } from '@/lib/constants/contentLimits';
import { showError } from '@/lib/errorHelper';
import { postFeedback } from '@/lib/services/feedbackApi';
import { colors } from '@/lib/theme';

export default function ProfileSuggestionsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  const submit = useMutation({
    mutationFn: () => postFeedback({ type: 'suggestion', message: message.trim() }),
    onSuccess: () => {
      setMessage('');
      Alert.alert(t('common.done'), t('profile.feedbackSent'));
    },
    onError: (e) => showError(t('common.error'), e, t('profile.feedbackSendFailed')),
  });

  const canSend = message.trim().length > 0;

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ padding: 20, paddingBottom: Math.max(insets.bottom, 24) }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-[14px] text-text-muted mb-3">{t('profile.suggestionsHint')}</Text>
      <TextInput
        className="bg-card border border-border rounded-[12px] px-[14px] py-3 text-[15px] text-text-primary min-h-[180px]"
        style={{ textAlignVertical: 'top' }}
        multiline
        placeholder={t('profile.suggestionsPlaceholder')}
        placeholderTextColor={colors.textPlaceholder}
        value={message}
        onChangeText={setMessage}
        maxLength={CONTENT_LIMITS.feedbackMessageMax}
      />
      <View className="mt-1 mb-4">
        <Text className="text-[12px] text-text-muted text-right mb-1">
          {message.length}/{CONTENT_LIMITS.feedbackMessageMax}
        </Text>
        <CharacterLimitNotice currentLength={message.length} maxLength={CONTENT_LIMITS.feedbackMessageMax} />
      </View>
      <Pressable
        className={`bg-primary rounded-[12px] py-4 items-center ${!canSend || submit.isPending ? 'opacity-50' : ''}`}
        disabled={!canSend || submit.isPending}
        onPress={() => submit.mutate()}
      >
        <Text className="text-white text-[16px] font-semibold">{t('profile.sendSuggestion')}</Text>
      </Pressable>
    </ScrollView>
  );
}
