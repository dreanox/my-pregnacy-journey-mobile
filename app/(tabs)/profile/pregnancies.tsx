import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiInstantToLocal, parseCalendarDateFromApi } from '@/lib/date/apiDates';
import { queryKeys } from '@/lib/queryKeys';
import { fetchPregnancies } from '@/lib/services/weekEntry';
import type { Pregnancy } from '@/lib/types';
import { colors } from '@/lib/theme';

function formatPregnancyCreatedAt(iso: string): string {
  const c = apiInstantToLocal(iso);
  return c.isValid() ? c.format('DD/MM/YYYY') : iso;
}

function formatPregnancySubtitle(p: Pregnancy, t: (k: string, o?: Record<string, unknown>) => string): string {
  const parts: string[] = [];
  if (p.last_period_date) {
    const d = parseCalendarDateFromApi(p.last_period_date);
    parts.push(d ? d.format('DD/MM/YYYY') : p.last_period_date.slice(0, 10));
  } else if (p.due_date) {
    const d = parseCalendarDateFromApi(p.due_date);
    parts.push(
      t('timeline.dueDate', { date: d ? d.format('DD/MM/YYYY') : p.due_date.slice(0, 10) })
    );
  }
  return parts.join(' · ');
}

export default function ProfilePregnanciesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: pregnancies, isPending } = useQuery({
    queryKey: queryKeys.pregnancies.all,
    queryFn: fetchPregnancies,
  });

  if (isPending) {
    return (
      <View className="flex-1 justify-center items-center bg-surface p-8">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const list = pregnancies ?? [];

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-5 pb-10">
      <Text className="text-[14px] text-text-secondary leading-5 mb-4">{t('profile.myPregnanciesHint')}</Text>
      {!list.length ? (
        <Text className="text-[15px] text-text-muted">{t('profile.noPregnanciesYet')}</Text>
      ) : (
        list.map((p) => (
          <Pressable
            key={p.id}
            onPress={() =>
              router.push({
                pathname: '/profile/pregnancy/[pregnancyId]',
                params: { pregnancyId: String(p.id) },
              })
            }
            className="bg-card rounded-[14px] border border-border p-4 mb-3 active:opacity-90"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1 min-w-0">
                <Text className="text-[16px] font-semibold text-text-primary">
                  {t('profile.pregnancyRowTitle', { date: formatPregnancyCreatedAt(p.created_at) })}
                </Text>
                {formatPregnancySubtitle(p, t) ? (
                  <Text className="text-[13px] text-text-muted mt-1" numberOfLines={2}>
                    {formatPregnancySubtitle(p, t)}
                  </Text>
                ) : null}
              </View>
              <View className="flex-row items-center shrink-0 gap-1">
                {p.is_active ? (
                  <View className="bg-primary-soft px-2 py-1 rounded-lg">
                    <Text className="text-[11px] font-semibold text-primary uppercase">{t('profile.pregnancyActiveBadge')}</Text>
                  </View>
                ) : (
                  <View className="bg-surface-muted px-2 py-1 rounded-lg">
                    <Text className="text-[11px] font-semibold text-text-muted uppercase">{t('profile.pregnancyArchivedBadge')}</Text>
                  </View>
                )}
                <FontAwesome name="chevron-right" size={14} color={colors.iconMuted} />
              </View>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
