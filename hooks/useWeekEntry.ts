import { useQuery } from '@tanstack/react-query';

import { useActivePregnancyId } from '@/hooks/useActivePregnancy';
import { queryKeys } from '@/lib/queryKeys';
import { fetchWeekEntry } from '@/lib/services/weekEntry';

export function useWeekEntry(weekEntryRouteId: string) {
  const pregnancyQ = useActivePregnancyId();
  const { pregnancyId, isPending: pregnancyLoading, isError: pregnancyIsError, error: pregnancyErr, isFetched: pregnancyFetched } =
    pregnancyQ;

  const enabled = Boolean(pregnancyId && weekEntryRouteId);

  const query = useQuery({
    queryKey: queryKeys.weekEntry.detail(weekEntryRouteId),
    queryFn: () => fetchWeekEntry(pregnancyId!, weekEntryRouteId),
    enabled,
  });

  const noActivePregnancy = pregnancyFetched && pregnancyId == null && !pregnancyIsError;

  return {
    ...query,
    pregnancyId,
    noActivePregnancy,
    isLoading: pregnancyLoading || (enabled && query.isPending),
    isError: pregnancyIsError || query.isError,
    error: pregnancyErr ?? query.error,
  };
}
