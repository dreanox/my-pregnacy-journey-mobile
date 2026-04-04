export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Pregnancy {
  id: number;
  user_id: number;
  due_date: string | null;
  last_period_date: string | null;
  current_week: number;
  is_active: boolean;
  created_at: string;
  week_entries?: WeekEntry[];
}

export interface Note {
  id: number;
  week_entry_id: number;
  content: string;
  created_at: string;
}

export interface WeekEntry {
  id: number;
  pregnancy_id: number;
  week_number: number;
  weight: number | null;
  entry_date: string | null;
  created_at: string;
  symptoms?: Symptom[];
  medications?: Medication[];
  photos?: Photo[];
  notes?: Note[];
  appointments?: Appointment[];
}

export interface Symptom {
  id: number;
  week_entry_id: number;
  name: string;
  is_custom: boolean;
}

export interface Medication {
  id: number;
  week_entry_id: number;
  name: string;
  dosage: string | null;
  start_week: number | null;
  end_week: number | null;
}

export interface Photo {
  id: number;
  week_entry_id: number;
  path: string;
  disk: string;
  caption: string | null;
  url?: string;
  created_at: string;
  week_entry?: { id: number; week_number: number };
}

export interface Appointment {
  id: number;
  week_entry_id: number;
  appointment_date: string;
  doctor_name: string | null;
  notes: string | null;
  week_entry?: { id: number; week_number: number };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const DEFAULT_SYMPTOMS = [
  'Nausea',
  'Dizziness',
  'Back pain',
  'Fatigue',
  'Headache',
  'Swelling',
  'Heartburn',
  'Insomnia',
  'Cramps',
  'Mood swings',
] as const;

export const SYMPTOM_I18N_KEYS: Record<string, string> = {
  'Nausea': 'symptoms.nausea',
  'Dizziness': 'symptoms.dizziness',
  'Back pain': 'symptoms.backPain',
  'Fatigue': 'symptoms.fatigue',
  'Headache': 'symptoms.headache',
  'Swelling': 'symptoms.swelling',
  'Heartburn': 'symptoms.heartburn',
  'Insomnia': 'symptoms.insomnia',
  'Cramps': 'symptoms.cramps',
  'Mood swings': 'symptoms.moodSwings',
};
