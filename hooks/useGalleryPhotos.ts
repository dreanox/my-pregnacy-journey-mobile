import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { fetchGalleryPhotos } from '@/lib/services/galleryApi';

export function useGalleryPhotos() {
  return useQuery({
    queryKey: queryKeys.gallery.all,
    queryFn: fetchGalleryPhotos,
  });
}
