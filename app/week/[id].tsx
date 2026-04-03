import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import api from '@/lib/api';
import { DEFAULT_SYMPTOMS } from '@/lib/types';
import type { WeekEntry, Note } from '@/lib/types';

export default function WeekDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: entry, isLoading } = useQuery({
    queryKey: ['weekEntry', id],
    queryFn: async () => {
      const pregnancyId = await getPregnancyId();
      const { data } = await api.get<WeekEntry>(
        `/pregnancies/${pregnancyId}/week-entries/${id}`
      );
      return data;
    },
  });

  if (isLoading || !entry) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Week ${entry.week_number}` }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <WeightSection entry={entry} />
          <NotesSection entry={entry} />
          <SymptomsSection entry={entry} />
          <MedicationsSection entry={entry} />
          <PhotosSection entry={entry} />
          <AppointmentsSection entry={entry} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

async function getPregnancyId(): Promise<number> {
  const { data } = await api.get('/pregnancies');
  const active = data.find((p: any) => p.is_active);
  return active.id;
}

function invalidateEntry(qc: any, id: string) {
  qc.invalidateQueries({ queryKey: ['weekEntry', id] });
  qc.invalidateQueries({ queryKey: ['weekEntries'] });
}

// --- Weight Section ---
function WeightSection({ entry }: { entry: WeekEntry }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [weight, setWeight] = useState(entry.weight?.toString() ?? '');
  const [editing, setEditing] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      const pregnancyId = await getPregnancyId();
      await api.put(`/pregnancies/${pregnancyId}/week-entries/${id}`, {
        weight: weight ? parseFloat(weight) : null,
      });
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      setEditing(false);
    },
  });

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          <FontAwesome name="balance-scale" size={16} /> Weight
        </Text>
        {!editing && (
          <Pressable onPress={() => setEditing(true)}>
            <FontAwesome name="pencil" size={16} color="#E91E8C" />
          </Pressable>
        )}
      </View>
      {editing ? (
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="e.g. 62.5"
            placeholderTextColor="#999"
          />
          <Pressable style={styles.smallButton} onPress={() => save.mutate()}>
            <Text style={styles.smallButtonText}>Save</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.valueText}>
          {entry.weight ? `${entry.weight} kg` : 'Not recorded'}
        </Text>
      )}
    </View>
  );
}

// --- Notes Section ---
function NotesSection({ entry }: { entry: WeekEntry }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');

  const canAdd = (entry.notes?.length ?? 0) < 14;

  const addNote = useMutation({
    mutationFn: async () => {
      await api.post(`/week-entries/${entry.id}/notes`, { content });
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      setContent('');
      setShowAdd(false);
    },
  });

  const updateNote = useMutation({
    mutationFn: async () => {
      if (!editingNote) return;
      await api.put(`/week-entries/${entry.id}/notes/${editingNote.id}`, { content: editContent });
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      setEditingNote(null);
      setEditContent('');
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: number) => {
      await api.delete(`/week-entries/${entry.id}/notes/${noteId}`);
    },
    onSuccess: () => invalidateEntry(qc, id),
  });

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          <FontAwesome name="book" size={16} /> Notes ({entry.notes?.length ?? 0}/14)
        </Text>
        {canAdd && (
          <Pressable onPress={() => setShowAdd(true)}>
            <FontAwesome name="plus-circle" size={20} color="#E91E8C" />
          </Pressable>
        )}
      </View>
      {entry.notes?.map((n) =>
        editingNote?.id === n.id ? (
          <View key={n.id} style={{ marginBottom: 8 }}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editContent}
              onChangeText={setEditContent}
              multiline
            />
            <View style={styles.row}>
              <Pressable style={styles.smallButton} onPress={() => updateNote.mutate()}>
                <Text style={styles.smallButtonText}>Save</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setEditingNote(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View key={n.id} style={styles.listItem}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => {
                setEditingNote(n);
                setEditContent(n.content);
              }}
            >
              <Text style={styles.listItemTitle} numberOfLines={3}>{n.content}</Text>
              <Text style={styles.listItemSub}>
                {new Date(n.created_at).toLocaleDateString()}
              </Text>
            </Pressable>
            <Pressable onPress={() => deleteNote.mutate(n.id)}>
              <FontAwesome name="trash-o" size={16} color="#ccc" />
            </Pressable>
          </View>
        )
      )}
      {!entry.notes?.length && <Text style={styles.valueText}>No notes yet</Text>}

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="How are you feeling today?"
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
            />
            <Pressable style={styles.primaryButton} onPress={() => addNote.mutate()}>
              <Text style={styles.primaryButtonText}>Add</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setShowAdd(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Symptoms Section ---
function SymptomsSection({ entry }: { entry: WeekEntry }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(entry.symptoms?.map((s) => s.name) ?? [])
  );
  const [custom, setCustom] = useState('');

  const sync = useMutation({
    mutationFn: async () => {
      const symptoms = Array.from(selected).map((name) => ({
        name,
        is_custom: !DEFAULT_SYMPTOMS.includes(name as any),
      }));
      await api.put(`/week-entries/${entry.id}/symptoms`, { symptoms });
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      setEditing(false);
    },
  });

  const toggleSymptom = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const addCustom = () => {
    if (custom.trim()) {
      setSelected((prev) => new Set(prev).add(custom.trim()));
      setCustom('');
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          <FontAwesome name="heartbeat" size={16} /> Symptoms
        </Text>
        {!editing ? (
          <Pressable onPress={() => setEditing(true)}>
            <FontAwesome name="pencil" size={16} color="#E91E8C" />
          </Pressable>
        ) : (
          <Pressable onPress={() => sync.mutate()}>
            <Text style={{ color: '#E91E8C', fontWeight: '600' }}>Done</Text>
          </Pressable>
        )}
      </View>
      {editing ? (
        <>
          <View style={styles.chipContainer}>
            {DEFAULT_SYMPTOMS.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, selected.has(s) && styles.chipActive]}
                onPress={() => toggleSymptom(s)}
              >
                <Text style={[styles.chipText, selected.has(s) && styles.chipTextActive]}>
                  {s}
                </Text>
              </Pressable>
            ))}
            {Array.from(selected)
              .filter((s) => !DEFAULT_SYMPTOMS.includes(s as any))
              .map((s) => (
                <Pressable
                  key={s}
                  style={[styles.chip, styles.chipActive]}
                  onPress={() => toggleSymptom(s)}
                >
                  <Text style={[styles.chipText, styles.chipTextActive]}>{s}</Text>
                </Pressable>
              ))}
          </View>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={custom}
              onChangeText={setCustom}
              placeholder="Add custom symptom"
              placeholderTextColor="#999"
            />
            <Pressable style={styles.smallButton} onPress={addCustom}>
              <Text style={styles.smallButtonText}>Add</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.chipContainer}>
          {entry.symptoms?.length ? (
            entry.symptoms.map((s) => (
              <View key={s.id} style={[styles.chip, styles.chipActive]}>
                <Text style={[styles.chipText, styles.chipTextActive]}>{s.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.valueText}>No symptoms recorded</Text>
          )}
        </View>
      )}
    </View>
  );
}

// --- Medications Section ---
function MedicationsSection({ entry }: { entry: WeekEntry }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');

  const addMed = useMutation({
    mutationFn: async () => {
      await api.post(`/week-entries/${entry.id}/medications`, {
        name: medName,
        dosage: medDosage || null,
      });
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      setMedName('');
      setMedDosage('');
      setShowAdd(false);
    },
  });

  const deleteMed = useMutation({
    mutationFn: async (medId: number) => {
      await api.delete(`/week-entries/${entry.id}/medications/${medId}`);
    },
    onSuccess: () => invalidateEntry(qc, id),
  });

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          <FontAwesome name="medkit" size={16} /> Medications
        </Text>
        <Pressable onPress={() => setShowAdd(true)}>
          <FontAwesome name="plus-circle" size={20} color="#E91E8C" />
        </Pressable>
      </View>
      {entry.medications?.map((m) => (
        <View key={m.id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{m.name}</Text>
            {m.dosage && <Text style={styles.listItemSub}>{m.dosage}</Text>}
          </View>
          <Pressable onPress={() => deleteMed.mutate(m.id)}>
            <FontAwesome name="trash-o" size={16} color="#ccc" />
          </Pressable>
        </View>
      ))}
      {!entry.medications?.length && <Text style={styles.valueText}>No medications</Text>}

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            <TextInput
              style={styles.input}
              placeholder="Medication name"
              placeholderTextColor="#999"
              value={medName}
              onChangeText={setMedName}
            />
            <TextInput
              style={styles.input}
              placeholder="Dosage (optional)"
              placeholderTextColor="#999"
              value={medDosage}
              onChangeText={setMedDosage}
            />
            <Pressable style={styles.primaryButton} onPress={() => addMed.mutate()}>
              <Text style={styles.primaryButtonText}>Add</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setShowAdd(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Photos Section ---
function PhotosSection({ entry }: { entry: WeekEntry }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const upload = useMutation({
    mutationFn: async (uri: string) => {
      const form = new FormData();
      const filename = uri.split('/').pop() ?? 'photo.jpg';
      form.append('photo', {
        uri,
        name: filename,
        type: 'image/jpeg',
      } as any);
      await api.post(`/week-entries/${entry.id}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (photoId: number) => {
      await api.delete(`/week-entries/${entry.id}/photos/${photoId}`);
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      upload.mutate(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take photos');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      upload.mutate(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          <FontAwesome name="camera" size={16} /> Photos
        </Text>
        <View style={styles.row}>
          <Pressable onPress={takePhoto} style={{ marginRight: 16 }}>
            <FontAwesome name="camera" size={18} color="#E91E8C" />
          </Pressable>
          <Pressable onPress={pickImage}>
            <FontAwesome name="image" size={18} color="#E91E8C" />
          </Pressable>
        </View>
      </View>
      {upload.isPending && (
        <ActivityIndicator style={{ marginVertical: 8 }} color="#E91E8C" />
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {entry.photos?.map((p) => (
          <View key={p.id} style={styles.photoThumb}>
            <Image source={{ uri: p.url }} style={styles.photoImage} />
            <Pressable
              style={styles.photoDelete}
              onPress={() =>
                Alert.alert('Delete Photo', 'Are you sure?', [
                  { text: 'Cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deletePhoto.mutate(p.id) },
                ])
              }
            >
              <FontAwesome name="times-circle" size={22} color="#E91E8C" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
      {!entry.photos?.length && <Text style={styles.valueText}>No photos yet</Text>}
    </View>
  );
}

// --- Appointments Section ---
function AppointmentsSection({ entry }: { entry: WeekEntry }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [notes, setNotes] = useState('');

  const addAppt = useMutation({
    mutationFn: async () => {
      await api.post(`/week-entries/${entry.id}/appointments`, {
        appointment_date: date,
        doctor_name: doctor || null,
        notes: notes || null,
      });
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      qc.invalidateQueries({ queryKey: ['appointments-upcoming'] });
      setDate('');
      setDoctor('');
      setNotes('');
      setShowAdd(false);
    },
    onError: () => Alert.alert('Error', 'Please enter a valid date (YYYY-MM-DD)'),
  });

  const deleteAppt = useMutation({
    mutationFn: async (apptId: number) => {
      await api.delete(`/week-entries/${entry.id}/appointments/${apptId}`);
    },
    onSuccess: () => {
      invalidateEntry(qc, id);
      qc.invalidateQueries({ queryKey: ['appointments-upcoming'] });
    },
  });

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          <FontAwesome name="calendar-check-o" size={16} /> Appointments
        </Text>
        <Pressable onPress={() => setShowAdd(true)}>
          <FontAwesome name="plus-circle" size={20} color="#E91E8C" />
        </Pressable>
      </View>
      {entry.appointments?.map((a) => (
        <View key={a.id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{a.appointment_date}</Text>
            {a.doctor_name && <Text style={styles.listItemSub}>{a.doctor_name}</Text>}
            {a.notes && <Text style={styles.listItemSub}>{a.notes}</Text>}
          </View>
          <Pressable onPress={() => deleteAppt.mutate(a.id)}>
            <FontAwesome name="trash-o" size={16} color="#ccc" />
          </Pressable>
        </View>
      ))}
      {!entry.appointments?.length && <Text style={styles.valueText}>No appointments</Text>}

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#999"
              value={date}
              onChangeText={setDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Doctor name (optional)"
              placeholderTextColor="#999"
              value={doctor}
              onChangeText={setDoctor}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes (optional)"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <Pressable style={styles.primaryButton} onPress={() => addAppt.mutate()}>
              <Text style={styles.primaryButtonText}>Add Appointment</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setShowAdd(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  valueText: { fontSize: 15, color: '#888' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  smallButton: {
    backgroundColor: '#E91E8C',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  smallButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActive: { backgroundColor: '#FFF0F5', borderColor: '#E91E8C' },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#E91E8C', fontWeight: '600' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  listItemTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  listItemSub: { fontSize: 13, color: '#888', marginTop: 2 },
  photoThumb: { width: 100, height: 100, borderRadius: 10, marginRight: 10, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoDelete: { position: 'absolute', top: 4, right: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 20 },
  primaryButton: {
    backgroundColor: '#E91E8C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  cancelButton: { alignItems: 'center', marginTop: 12 },
  cancelText: { color: '#666', fontSize: 16 },
});
