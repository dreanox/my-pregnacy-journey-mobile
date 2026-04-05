import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { NoteEditorModal } from '@/components/modals/NoteEditorModal';
import { NoteReadOnlyViewerModal } from '@/components/modals/NoteReadOnlyViewerModal';
import { useInvalidateWeekEntry } from '@/hooks/useInvalidateWeekEntry';
import { CONTENT_LIMITS } from '@/lib/constants/contentLimits';
import { showError } from '@/lib/errorHelper';
import {
  deleteWeekNote,
  postWeekNote,
  putWeekNote,
} from '@/lib/services/weekEntry';
import type { Note, WeekEntry } from '@/lib/types';
import { colors } from '@/lib/theme';

export type NotesSectionProps = {
  entry: WeekEntry;
  weekEntryRouteId: string;
  readOnly?: boolean;
};

export function NotesSection({ entry, weekEntryRouteId, readOnly = false }: NotesSectionProps) {
  const { t } = useTranslation();
  const invalidate = useInvalidateWeekEntry(weekEntryRouteId);
  const [noteModalMode, setNoteModalMode] = useState<null | 'add' | 'edit'>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [readOnlyViewerNote, setReadOnlyViewerNote] = useState<Note | null>(null);

  const canAdd = (entry.notes?.length ?? 0) < 14;

  const closeNoteModal = () => {
    setNoteModalMode(null);
    setNoteDraft('');
    setEditingNoteId(null);
  };

  const openAddNote = () => {
    setNoteModalMode('add');
    setNoteDraft('');
    setEditingNoteId(null);
  };

  const openEditNote = (n: Note) => {
    setNoteModalMode('edit');
    setNoteDraft(n.content);
    setEditingNoteId(n.id);
  };

  const addNote = useMutation({
    mutationFn: (content: string) => postWeekNote(entry.id, content),
    onSuccess: () => {
      invalidate();
      closeNoteModal();
    },
    onError: (e) => showError(t('common.error'), e, t('week.noteSaveFailed')),
  });

  const updateNote = useMutation({
    mutationFn: (payload: { noteId: number; content: string }) =>
      putWeekNote(entry.id, payload.noteId, payload.content),
    onSuccess: () => {
      invalidate();
      closeNoteModal();
    },
    onError: (e) => showError(t('common.error'), e, t('week.noteSaveFailed')),
  });

  const deleteNote = useMutation({
    mutationFn: (noteId: number) => deleteWeekNote(entry.id, noteId),
    onSuccess: () => invalidate(),
  });

  const savingNote = addNote.isPending || updateNote.isPending;
  const trimmedDraft = noteDraft.trim();
  const canSaveNote =
    trimmedDraft.length > 0 && trimmedDraft.length <= CONTENT_LIMITS.noteContentMax;

  const handleSaveNote = () => {
    const body = noteDraft.trim();
    if (!body || body.length > CONTENT_LIMITS.noteContentMax) return;
    if (noteModalMode === 'add') {
      addNote.mutate(body);
      return;
    }
    if (noteModalMode === 'edit' && editingNoteId != null) {
      updateNote.mutate({ noteId: editingNoteId, content: body });
    }
  };

  return (
    <View className="bg-card rounded-[14px] p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-3 min-w-0 shrink">
          <Text className="text-[17px] font-bold text-text-primary" numberOfLines={2}>
            <FontAwesome name="book" size={16} /> {t('week.notesCount', { count: entry.notes?.length ?? 0 })}
          </Text>
        </View>
        {!readOnly && canAdd && (
          <Pressable onPress={openAddNote} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} className="p-1">
            <FontAwesome name="plus-circle" size={20} color={colors.primary} />
          </Pressable>
        )}
      </View>
      {entry.notes?.map((n) => (
        <View key={n.id} className="flex-row items-center py-2.5 border-b border-b-surface-muted">
          {readOnly ? (
            <Pressable
              className="flex-1 active:opacity-80"
              onPress={() => setReadOnlyViewerNote(n)}
            >
              <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={4}>
                {n.content}
              </Text>
              <Text className="text-[13px] text-text-muted mt-0.5">
                {new Date(n.created_at).toLocaleDateString()}
              </Text>
              <Text className="text-[12px] text-primary font-medium mt-1.5">{t('week.readOnlyNoteTapHint')}</Text>
            </Pressable>
          ) : (
            <>
              <Pressable className="flex-1" onPress={() => openEditNote(n)}>
                <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={3}>
                  {n.content}
                </Text>
                <Text className="text-[13px] text-text-muted mt-0.5">
                  {new Date(n.created_at).toLocaleDateString()}
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(t('week.deleteNoteTitle'), t('week.deleteNoteMessage'), [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                      text: t('common.delete'),
                      style: 'destructive',
                      onPress: () => deleteNote.mutate(n.id),
                    },
                  ])
                }
                className="w-11 items-center justify-center py-2 pl-2"
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              >
                <FontAwesome name="trash-o" size={16} color={colors.iconMuted} />
              </Pressable>
            </>
          )}
        </View>
      ))}
      {!entry.notes?.length && <Text className="text-[15px] text-text-muted">{t('week.noNotes')}</Text>}

      <NoteReadOnlyViewerModal
        visible={readOnlyViewerNote != null}
        content={readOnlyViewerNote?.content ?? ''}
        dateLabel={
          readOnlyViewerNote ? new Date(readOnlyViewerNote.created_at).toLocaleString() : ''
        }
        onClose={() => setReadOnlyViewerNote(null)}
      />

      <NoteEditorModal
        visible={!readOnly && noteModalMode !== null}
        mode={noteModalMode === 'edit' ? 'edit' : 'add'}
        titleAdd={t('week.addNote')}
        titleEdit={t('week.editNote')}
        draft={noteDraft}
        onChangeDraft={setNoteDraft}
        placeholder={t('week.notePlaceholder')}
        maxLength={CONTENT_LIMITS.noteContentMax}
        onClose={closeNoteModal}
        onSave={handleSaveNote}
        saving={savingNote}
        canSave={canSaveNote}
        cancelLabel={t('common.cancel')}
        saveLabel={t('common.save')}
      />
    </View>
  );
}
