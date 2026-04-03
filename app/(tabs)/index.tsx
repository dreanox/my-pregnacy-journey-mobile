import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';

import api from '@/lib/api';
import type { Pregnancy, WeekEntry } from '@/lib/types';

export default function TimelineScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showNewPregnancy, setShowNewPregnancy] = useState(false);
  const [dueDate, setDueDate] = useState('');

  const { data: pregnancies, isLoading: loadingPregs } = useQuery({
    queryKey: ['pregnancies'],
    queryFn: async () => {
      const { data } = await api.get<Pregnancy[]>('/pregnancies');
      return data;
    },
  });

  const activePregnancy = pregnancies?.find((p) => p.is_active);

  const { data: weekEntries, isLoading: loadingEntries } = useQuery({
    queryKey: ['weekEntries', activePregnancy?.id],
    queryFn: async () => {
      const { data } = await api.get<WeekEntry[]>(
        `/pregnancies/${activePregnancy!.id}/week-entries`
      );
      return data;
    },
    enabled: !!activePregnancy,
  });

  const createPregnancy = useMutation({
    mutationFn: async (payload: { due_date?: string; current_week?: number }) => {
      const { data } = await api.post<Pregnancy>('/pregnancies', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pregnancies'] });
      setShowNewPregnancy(false);
      setDueDate('');
    },
    onError: () => Alert.alert('Error', 'Could not create pregnancy'),
  });

  const createWeekEntry = useMutation({
    mutationFn: async (weekNumber: number) => {
      const { data } = await api.post<WeekEntry>(
        `/pregnancies/${activePregnancy!.id}/week-entries`,
        { week_number: weekNumber }
      );
      return data;
    },
    onSuccess: (entry) => {
      qc.invalidateQueries({ queryKey: ['weekEntries'] });
      router.push(`/week/${entry.id}` as any);
    },
  });

  const currentWeek = activePregnancy?.current_week ?? 1;
  const allWeeks = Array.from({ length: 42 }, (_, i) => i + 1);
  const entryMap = new Map((weekEntries ?? []).map((e) => [e.week_number, e]));

  const handleWeekPress = (weekNum: number) => {
    const existing = entryMap.get(weekNum);
    if (existing) {
      router.push(`/week/${existing.id}` as any);
    } else {
      createWeekEntry.mutate(weekNum);
    }
  };

  if (loadingPregs) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  if (!activePregnancy) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🤰</Text>
        <Text style={styles.emptyTitle}>Start Your Journey</Text>
        <Text style={styles.emptySubtitle}>Track every beautiful moment</Text>
        <Pressable style={styles.primaryButton} onPress={() => setShowNewPregnancy(true)}>
          <Text style={styles.primaryButtonText}>Begin Tracking</Text>
        </Pressable>

        <Modal visible={showNewPregnancy} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Pregnancy</Text>
              <TextInput
                style={styles.input}
                placeholder="Due date (YYYY-MM-DD)"
                placeholderTextColor="#999"
                value={dueDate}
                onChangeText={setDueDate}
              />
              <Pressable
                style={styles.primaryButton}
                onPress={() =>
                  createPregnancy.mutate({
                    due_date: dueDate || undefined,
                    current_week: 1,
                  })
                }
              >
                <Text style={styles.primaryButtonText}>Create</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setShowNewPregnancy(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Week {currentWeek}</Text>
        {activePregnancy.due_date && (
          <Text style={styles.headerSubtitle}>Due: {activePregnancy.due_date}</Text>
        )}
      </View>

      {loadingEntries ? (
        <ActivityIndicator style={{ marginTop: 32 }} size="large" color="#E91E8C" />
      ) : (
        <FlatList
          data={allWeeks}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item: weekNum }) => {
            const entry = entryMap.get(weekNum);
            const isCurrent = weekNum === currentWeek;
            const hasData = !!entry;

            return (
              <Pressable
                style={[
                  styles.weekCard,
                  isCurrent && styles.weekCardCurrent,
                  hasData && styles.weekCardFilled,
                ]}
                onPress={() => handleWeekPress(weekNum)}
              >
                <View style={styles.weekLeft}>
                  <View
                    style={[styles.weekBadge, isCurrent && styles.weekBadgeCurrent]}
                  >
                    <Text
                      style={[styles.weekBadgeText, isCurrent && styles.weekBadgeTextCurrent]}
                    >
                      {weekNum}
                    </Text>
                  </View>
                  <View style={styles.weekInfo}>
                    <Text style={[styles.weekTitle, isCurrent && styles.weekTitleCurrent]}>
                      Week {weekNum}
                    </Text>
                    {entry && (
                      <View style={styles.weekMeta}>
                        {entry.weight && (
                          <Text style={styles.metaText}>
                            <FontAwesome name="balance-scale" size={11} /> {entry.weight} kg
                          </Text>
                        )}
                        {(entry.symptoms?.length ?? 0) > 0 && (
                          <Text style={styles.metaText}>
                            <FontAwesome name="heartbeat" size={11} /> {entry.symptoms!.length}
                          </Text>
                        )}
                        {(entry.photos?.length ?? 0) > 0 && (
                          <Text style={styles.metaText}>
                            <FontAwesome name="camera" size={11} /> {entry.photos!.length}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
                <FontAwesome name="chevron-right" size={14} color="#ccc" />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0F5', padding: 32 },
  header: {
    backgroundColor: '#E91E8C',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  list: { padding: 16, paddingBottom: 32 },
  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  weekCardCurrent: {
    borderColor: '#E91E8C',
    borderWidth: 2,
    backgroundColor: '#FFF0F5',
  },
  weekCardFilled: {
    backgroundColor: '#FEFEFE',
  },
  weekLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  weekBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  weekBadgeCurrent: { backgroundColor: '#E91E8C' },
  weekBadgeText: { fontSize: 15, fontWeight: '600', color: '#666' },
  weekBadgeTextCurrent: { color: '#fff' },
  weekInfo: { flex: 1 },
  weekTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  weekTitleCurrent: { color: '#E91E8C' },
  weekMeta: { flexDirection: 'row', marginTop: 4, gap: 12 },
  metaText: { fontSize: 12, color: '#888' },
  emptyEmoji: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 26, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  primaryButton: {
    backgroundColor: '#E91E8C',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 20 },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    color: '#1a1a2e',
  },
  cancelButton: { alignItems: 'center', marginTop: 12 },
  cancelText: { color: '#666', fontSize: 16 },
});
