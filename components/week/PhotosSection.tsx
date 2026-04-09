import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useInvalidateWeekEntry } from '@/hooks/useInvalidateWeekEntry';
import { CONTENT_LIMITS } from '@/lib/constants/contentLimits';
import { showError } from '@/lib/errorHelper';
import { queryKeys } from '@/lib/queryKeys';
import { deleteWeekPhoto, postWeekPhoto } from '@/lib/services/weekEntry';
import type { WeekEntry } from '@/lib/types';
import { colors } from '@/lib/theme';
import { buildPhotoFormDataPart } from '@/lib/utils/imageUpload';
import { resolvePhotoDisplayUrl } from '@/lib/utils/photoUrl';

export type PhotosSectionProps = {
  entry: WeekEntry;
  weekEntryRouteId: string;
  readOnly?: boolean;
};

export function PhotosSection({ entry, weekEntryRouteId, readOnly = false }: PhotosSectionProps) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const invalidate = useInvalidateWeekEntry(weekEntryRouteId);

  const upload = useMutation({
    mutationFn: async ({ uri, mimeType }: { uri: string; mimeType?: string | null }) => {
      const form = new FormData();
      const part = buildPhotoFormDataPart(uri, mimeType);
      form.append('photo', part as unknown as Blob);
      await postWeekPhoto(entry.id, form);
    },
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.gallery.all });
    },
    onError: (e) => showError(t('common.error'), e, t('week.photoUploadFailed')),
  });

  const deletePhoto = useMutation({
    mutationFn: (photoId: number) => deleteWeekPhoto(entry.id, photoId),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.gallery.all });
    },
  });

  const photoCount = entry.photos?.length ?? 0;

  const ensureCanAddPhoto = () => {
    if (photoCount >= CONTENT_LIMITS.photosPerWeekMax) {
      Alert.alert(t('common.error'), t('week.photosPerWeekLimit'));
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (!ensureCanAddPhoto()) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      upload.mutate({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };

  const takePhoto = async () => {
    if (!ensureCanAddPhoto()) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('week.permissionNeeded'), t('week.cameraPermission'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      upload.mutate({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };

  return (
    <View className="bg-card rounded-[14px] p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-3 min-w-0 shrink">
          <Text className="text-[17px] font-bold text-text-primary" numberOfLines={2}>
            <FontAwesome name="camera" size={16} /> {t('week.photos')}
          </Text>
        </View>
        {!readOnly && (
          <View className="flex-row items-center gap-2">
            <Pressable onPress={takePhoto} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} className="mr-2 p-1">
              <FontAwesome name="camera" size={18} color={colors.primary} />
            </Pressable>
            <Pressable onPress={pickImage} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} className="p-1">
              <FontAwesome name="image" size={18} color={colors.primary} />
            </Pressable>
          </View>
        )}
      </View>
      {upload.isPending && (
        <ActivityIndicator className="my-2" color={colors.primary} />
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {entry.photos?.map((p) => {
          const photoUri = resolvePhotoDisplayUrl(p);
          return (
          <View key={p.id} className="w-[100px] h-[100px] rounded-[10px] mr-2.5 overflow-hidden bg-border">
            {photoUri ? (
              <Image source={{ uri: photoUri }} className="w-full h-full" resizeMode="cover" />
            ) : null}
            {!readOnly && (
              <Pressable
                className="absolute top-1 right-1"
                onPress={() =>
                  Alert.alert(t('week.deletePhoto'), t('week.areYouSure'), [
                    { text: t('common.cancel') },
                    { text: t('common.delete'), style: 'destructive', onPress: () => deletePhoto.mutate(p.id) },
                  ])
                }
              >
                <FontAwesome name="times-circle" size={22} color={colors.primary} />
              </Pressable>
            )}
          </View>
          );
        })}
      </ScrollView>
      {!entry.photos?.length && <Text className="text-[15px] text-text-muted">{t('week.noPhotos')}</Text>}
    </View>
  );
}
