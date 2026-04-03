import { useQuery } from '@tanstack/react-query';
import { Image } from 'react-native';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import api from '@/lib/api';
import type { Photo } from '@/lib/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const TILE_GAP = 2;
const TILE_SIZE = (SCREEN_WIDTH - TILE_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function GalleryScreen() {
  const { data: photos, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const { data } = await api.get<Photo[]>('/gallery');
      return data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  if (!photos?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📸</Text>
        <Text style={styles.emptyTitle}>No Photos Yet</Text>
        <Text style={styles.emptySubtitle}>
          Add photos to your weekly entries to see your belly evolution here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      numColumns={NUM_COLUMNS}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <View style={styles.tile}>
          <Image source={{ uri: item.url }} style={styles.tileImage} />
          <View style={styles.tileOverlay}>
            <Text style={styles.tileWeek}>W{item.week_entry?.week_number}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#FAFAFA' },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
  grid: { padding: TILE_GAP },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: TILE_GAP / 2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  tileImage: { width: '100%', height: '100%' },
  tileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  tileWeek: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
