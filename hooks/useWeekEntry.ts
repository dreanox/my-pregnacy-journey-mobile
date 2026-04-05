import { useQuery } from '@tanstack/react-query';

import { useActivePregnancyId } from '@/hooks/useActivePregnancy';
import { queryKeys } from '@/lib/queryKeys';
import { fetchWeekEntry } from '@/lib/services/weekEntry';

export type UseWeekEntryOptions = {
  /** When set (e.g. viewing an archived pregnancy), fetch using this pregnancy id instead of the active one. */
  pregnancyIdOverride?: string | string[] | undefined;
};

function normalizeParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export function useWeekEntry(weekEntryRouteId: string | undefined, options?: UseWeekEntryOptions) {
  const pregnancyQ = useActivePregnancyId();
  const {
    isFetched: pregnancyFetched,
    isError: pregnancyIsError,
    error: pregnancyErr,
    isPending: pregnancyLoading,
    activePregnancy,
  } = pregnancyQ;

  const overrideRaw = normalizeParam(options?.pregnancyIdOverride);
  const overrideNum = overrideRaw != null && overrideRaw !== '' ? Number(overrideRaw) : NaN;
  const overrideValid = Number.isFinite(overrideNum) && overrideNum > 0;

  const resolvedPregnancyId = overrideValid ? overrideNum : activePregnancy?.id;

  const enabled = Boolean(weekEntryRouteId && resolvedPregnancyId);

  const query = useQuery({
    queryKey: queryKeys.weekEntry.detail(weekEntryRouteId ?? ''),
    queryFn: () => fetchWeekEntry(resolvedPregnancyId!, weekEntryRouteId!),
    enabled,
  });

  const noActivePregnancy =
    pregnancyFetched && !overrideValid && activePregnancy == null && !pregnancyIsError;

  return {
    ...query,
    pregnancyId: resolvedPregnancyId ?? null,
    noActivePregnancy,
    isLoading: (!overrideValid && pregnancyLoading) || (enabled && query.isPending),
    isError: pregnancyIsError || query.isError,
    error: pregnancyErr ?? query.error,
  };
}
