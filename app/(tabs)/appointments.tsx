import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import api from '@/lib/api';
import type { Appointment } from '@/lib/types';

export default function AppointmentsScreen() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments-upcoming'],
    queryFn: async () => {
      const { data } = await api.get<Appointment[]>('/appointments/upcoming');
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

  if (!appointments?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🏥</Text>
        <Text style={styles.emptyTitle}>No Upcoming Appointments</Text>
        <Text style={styles.emptySubtitle}>
          Add appointments from your weekly entries
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateDay}>
              {new Date(item.appointment_date).getDate()}
            </Text>
            <Text style={styles.dateMonth}>
              {new Date(item.appointment_date).toLocaleString('en', { month: 'short' })}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            {item.doctor_name && (
              <Text style={styles.doctorName}>
                <FontAwesome name="user-md" size={14} /> {item.doctor_name}
              </Text>
            )}
            {item.notes && <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>}
            {item.week_entry && (
              <Text style={styles.weekTag}>Week {item.week_entry.week_number}</Text>
            )}
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
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dateContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dateDay: { fontSize: 20, fontWeight: '700', color: '#E91E8C' },
  dateMonth: { fontSize: 11, color: '#E91E8C', fontWeight: '600', textTransform: 'uppercase' },
  cardInfo: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  notes: { fontSize: 13, color: '#666', marginBottom: 4 },
  weekTag: { fontSize: 12, color: '#E91E8C', fontWeight: '500' },
});
