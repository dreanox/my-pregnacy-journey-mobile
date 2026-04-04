import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { queryKeys } from '@/lib/queryKeys';

export function useInvalidateWeekEntry(weekEntryRouteId: string) {
  const qc = useQueryClient();

  return useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.weekEntry.detail(weekEntryRouteId) });
    qc.invalidateQueries({ queryKey: queryKeys.weekEntries.all });
  }, [qc, weekEntryRouteId]);
}
