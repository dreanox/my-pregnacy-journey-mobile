import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.oops') }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-5xl mb-4">🤷</Text>
        <Text className="text-xl font-bold text-text-primary">{t('notFound.pageNotFound')}</Text>
        <Link href="/" className="mt-4 py-2">
          <Text className="text-base font-semibold text-primary">{t('notFound.goHome')}</Text>
        </Link>
      </View>
    </>
  );
}
