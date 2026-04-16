export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  accepted_terms_at?: string | null;
  accepted_privacy_at?: string | null;
  legal_terms_version?: string | null;
  legal_privacy_version?: string | null;
  accepted_adult?: boolean;
  accepted_at?: string | null;
  /** Trusted account (server); broad in-app diagnostics when true. */
  is_developer?: boolean;
  /**
   * Boolean toggles from the API (`users.feature_flags`). Keys are defined only on the backend;
   * the app reads them by name via `hasFeatureFlag` / helpers in `featureFlags.ts`.
   */
  feature_flags?: Record<string, boolean> | null;
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
  /** Minutos antes de la cita (5–120); null = sin recordatorio push/local sincronizado. */
  reminder_minutes_before?: number | null;
  /** Fecha/hora tal como la vio la usuaria al guardar (para el texto del push `:time`). */
  reminder_display_time?: string | null;
  /** Idioma de plantilla del push al guardar (`es` | `en`). */
  reminder_locale?: 'es' | 'en' | null;
  /** Si existe, el recordatorio ya se consideró entregado (push o ack local). */
  reminder_notified_at?: string | null;
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
