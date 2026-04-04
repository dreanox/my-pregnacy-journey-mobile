import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { fetchPregnancies } from '@/lib/services/weekEntry';
const STALE_MS = 60_000;

export function useActivePregnancy() {
  return useQuery({
    queryKey: queryKeys.pregnancies.all,
    queryFn: fetchPregnancies,
    staleTime: STALE_MS,
  });
}

export function useActivePregnancyId() {
  const query = useActivePregnancy();
  const activePregnancy = query.data?.find((p) => p.is_active);
  return {
    ...query,
    activePregnancy,
    pregnancyId: activePregnancy?.id,
  };
}
