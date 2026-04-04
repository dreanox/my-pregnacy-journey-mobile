import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FullScreenPhotoModal } from '@/components/gallery';
import { useDeleteGalleryPhoto } from '@/hooks/useDeleteGalleryPhoto';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { colors } from '@/lib/theme';
import type { Photo } from '@/lib/types';
import { resolvePhotoDisplayUrl } from '@/lib/utils/photoUrl';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const TILE_GAP = 2;
const TILE_SIZE = (SCREEN_WIDTH - TILE_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function GalleryScreen() {
  const { t } = useTranslation();
  const { data: photos, isPending: isLoading } = useGalleryPhotos();
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);

  const deletePhoto = useDeleteGalleryPhoto({
    onSuccess: () => setViewerPhoto(null),
  });

  const viewerUri = viewerPhoto ? (resolvePhotoDisplayUrl(viewerPhoto) ?? null) : null;
  const viewerWeekBadge = viewerPhoto
    ? t('gallery.weekShort', { number: viewerPhoto.week_entry?.week_number ?? '—' })
    : '';

  const handleDeleteFromViewer = () => {
    if (!viewerPhoto || deletePhoto.isPending) return;
    Alert.alert(t('gallery.deletePhotoTitle'), t('gallery.deletePhotoMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          deletePhoto.mutate({
            weekEntryId: viewerPhoto.week_entry_id,
            photoId: viewerPhoto.id,
          }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-8 bg-surface">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!photos?.length) {
    return (
      <View className="flex-1 justify-center items-center p-8 bg-surface">
        <Text className="text-[64px] mb-4">📸</Text>
        <Text className="text-[22px] font-bold text-text-primary mb-2">{t('gallery.noPhotos')}</Text>
        <Text className="text-sm text-text-muted text-center">{t('gallery.addPhotosHint')}</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={photos}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: TILE_GAP }}
        renderItem={({ item }) => {
          const photoUri = resolvePhotoDisplayUrl(item);
          return (
            <Pressable
              onPress={() => setViewerPhoto(item)}
              style={{ width: TILE_SIZE, height: TILE_SIZE, margin: TILE_GAP / 2 }}
              className="rounded-lg overflow-hidden bg-border active:opacity-90"
              accessibilityRole="button"
              accessibilityLabel={t('gallery.openFullScreenA11y', {
                number: item.week_entry?.week_number ?? '',
              })}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} className="w-full h-full" />
              ) : null}
              <View className="absolute bottom-0 left-0 right-0 bg-black/40 py-[3px] px-1.5">
                <Text className="text-white text-[11px] font-semibold">
                  {t('gallery.weekShort', { number: item.week_entry?.week_number })}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <FullScreenPhotoModal
        visible={viewerPhoto !== null}
        photoUri={viewerUri}
        weekBadge={viewerWeekBadge}
        onClose={() => !deletePhoto.isPending && setViewerPhoto(null)}
        onDeletePress={handleDeleteFromViewer}
        deleting={deletePhoto.isPending}
        closeAccessibilityLabel={t('gallery.closeViewerA11y')}
        deleteAccessibilityLabel={t('gallery.deletePhotoA11y')}
      />
    </>
  );
}
