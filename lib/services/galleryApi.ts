import api from '@/lib/api';
import type { Photo } from '@/lib/types';

export async function fetchGalleryPhotos(): Promise<Photo[]> {
  const { data } = await api.get<Photo[]>('/gallery');
  return data;
}
