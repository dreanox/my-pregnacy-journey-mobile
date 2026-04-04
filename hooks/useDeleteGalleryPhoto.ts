import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { showError } from '@/lib/errorHelper';
import { queryKeys } from '@/lib/queryKeys';
import { deleteWeekPhoto } from '@/lib/services/weekEntry';

export function useDeleteGalleryPhoto(options?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ weekEntryId, photoId }: { weekEntryId: number; photoId: number }) =>
      deleteWeekPhoto(weekEntryId, photoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.gallery.all });
      qc.invalidateQueries({ queryKey: ['weekEntries'] });
      qc.invalidateQueries({ queryKey: ['weekEntry'] });
      options?.onSuccess?.();
    },
    onError: (e) => showError(t('common.error'), e, t('gallery.deleteFailed')),
  });
}
