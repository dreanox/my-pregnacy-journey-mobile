import api from '@/lib/api';

export type FeedbackType = 'bug' | 'suggestion' | 'complaint' | 'other';

export async function postFeedback(payload: { type: FeedbackType; message: string }): Promise<void> {
  await api.post('/feedback', payload);
}
