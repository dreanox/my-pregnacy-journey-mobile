import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type ImageErrorEventData, Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { getApiOrigin } from '@/lib/constants/network';
import { showPhotoLoadDiagnostics } from '@/lib/featureFlags';
import { colors } from '@/lib/theme';

type RemotePhotoImageProps = {
  uri: string;
  /** Stable key helps recycling in lists (e.g. photo id). */
  recyclingKey?: string;
  contentFit?: 'cover' | 'contain';
};

function formatLoadError(event: ImageErrorEventData): string {
  const raw = typeof event?.error === 'string' ? event.error.trim() : '';
  return raw.length > 0 ? raw : '(expo-image: empty error string)';
}

/**
 * Remote image: detailed load diagnostics when the server sends matching `feature_flags` / `is_developer`, or __DEV__.
 */
export function RemotePhotoImage({ uri, recyclingKey, contentFit = 'cover' }: RemotePhotoImageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const diagnostics = showPhotoLoadDiagnostics(user);
  const [failed, setFailed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  if (!uri) return null;

  return (
    <View style={styles.fill}>
      {!failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          recyclingKey={recyclingKey ?? uri}
          onError={(e: ImageErrorEventData) => {
            setLoadError(formatLoadError(e));
            setFailed(true);
          }}
          onLoad={() => {
            setLoadError(null);
            setFailed(false);
          }}
        />
      ) : diagnostics ? (
        <View style={[StyleSheet.absoluteFill, styles.errorBox]}>
          <FontAwesome name="exclamation-circle" size={20} color={colors.textMuted} />
          <ScrollView
            style={styles.errorScroll}
            contentContainerStyle={styles.errorScrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            <Text style={styles.errorText} selectable>
              {t('common.photoLoadFailed')}
              {'\n\n'}
              {t('common.photoLoadFailedTechnical')}
              {'\n'}
              {loadError ?? '(unknown)'}
              {'\n\n'}
              {t('common.photoLoadFailedUrlLabel')}
              {'\n'}
              {uri}
              {'\n\n'}
              {t('common.photoLoadFailedApiOrigin')}
              {'\n'}
              {getApiOrigin()}
            </Text>
          </ScrollView>
        </View>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.errorBox]}>
          <FontAwesome name="exclamation-circle" size={22} color={colors.textMuted} />
          <Text style={styles.errorTextCompact} numberOfLines={4}>
            {t('common.photoLoadFailed')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
    minWidth: 1,
    minHeight: 1,
    overflow: 'hidden',
  },
  errorBox: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  errorScroll: {
    alignSelf: 'stretch',
    flexGrow: 1,
    marginTop: 4,
    maxHeight: '100%',
  },
  errorScrollContent: {
    paddingBottom: 4,
  },
  errorText: {
    fontSize: 9,
    lineHeight: 12,
    color: colors.textMuted,
    textAlign: 'left',
  },
  errorTextCompact: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
});
