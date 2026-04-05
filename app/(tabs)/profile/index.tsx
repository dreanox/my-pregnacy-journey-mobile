import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.confirmLogout'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.signOut'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-10 pb-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-primary-soft justify-center items-center mb-4">
            <FontAwesome name="user" size={40} color={colors.primary} />
          </View>
          <Text className="text-[22px] font-bold text-text-primary">{user?.name}</Text>
          <Text className="text-sm text-text-muted">{user?.email}</Text>
        </View>

        <Pressable
          className="flex-row items-center bg-card p-4 rounded-[14px] mb-2 border border-border active:opacity-90"
          onPress={() => router.push('/profile/pregnancies')}
        >
          <FontAwesome name="history" size={18} color={colors.textSecondary} />
          <Text className="flex-1 text-base text-text-primary ml-[14px]">{t('profile.myPregnancies')}</Text>
          <FontAwesome name="chevron-right" size={14} color={colors.iconMuted} />
        </Pressable>
        <Pressable
          className="flex-row items-center bg-card p-4 rounded-[14px] mb-2 border border-border active:opacity-90"
          onPress={() => router.push('/profile/suggestions')}
        >
          <FontAwesome name="lightbulb-o" size={18} color={colors.textSecondary} />
          <Text className="flex-1 text-base text-text-primary ml-[14px]">{t('profile.suggestions')}</Text>
          <FontAwesome name="chevron-right" size={14} color={colors.iconMuted} />
        </Pressable>
        <Pressable
          className="flex-row items-center bg-card p-4 rounded-[14px] mb-2 border border-border active:opacity-90"
          onPress={() => router.push('/profile/complaints')}
        >
          <FontAwesome name="comment-o" size={18} color={colors.textSecondary} />
          <Text className="flex-1 text-base text-text-primary ml-[14px]">{t('profile.complaints')}</Text>
          <FontAwesome name="chevron-right" size={14} color={colors.iconMuted} />
        </Pressable>
        <Pressable
          className="flex-row items-center bg-card p-4 rounded-[14px] mb-2 border border-border active:opacity-90"
          onPress={() => router.push('/profile/settings')}
        >
          <FontAwesome name="cog" size={18} color={colors.textSecondary} />
          <Text className="flex-1 text-base text-text-primary ml-[14px]">{t('profile.settings')}</Text>
          <FontAwesome name="chevron-right" size={14} color={colors.iconMuted} />
        </Pressable>
        <Pressable
          className="flex-row items-center bg-card p-4 rounded-[14px] mb-2 border border-border active:opacity-90"
          onPress={() => router.push('/profile/about')}
        >
          <FontAwesome name="info-circle" size={18} color={colors.textSecondary} />
          <Text className="flex-1 text-base text-text-primary ml-[14px]">{t('profile.about')}</Text>
          <FontAwesome name="chevron-right" size={14} color={colors.iconMuted} />
        </Pressable>
      </ScrollView>

      <View
        className="px-5 pt-2 border-t border-border bg-surface"
        style={{ paddingBottom: Math.max(insets.bottom, 10) }}
      >
        <Pressable
          className="flex-row items-center justify-center gap-2.5 py-[14px] rounded-xl border border-primary"
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={18} color={colors.primary} />
          <Text className="text-base font-semibold text-primary">{t('profile.signOut')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
