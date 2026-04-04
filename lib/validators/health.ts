import { HEALTH_LIMITS } from '@/lib/constants/health';

export type WeightValidationError = 'INVALID_NUMBER' | 'OUT_OF_RANGE';
export type MedicationDosageValidationError = 'INVALID_NUMBER' | 'OUT_OF_RANGE';

export type WeightParseResult =
  | { ok: true; value: number | null }
  | { ok: false; error: WeightValidationError };

export type MedicationDosageParseResult =
  | { ok: true; value: number | null }
  | { ok: false; error: MedicationDosageValidationError };

export function parseWeightInput(raw: string): WeightParseResult {
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) return { ok: true, value: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return { ok: false, error: 'INVALID_NUMBER' };
  const { min, max } = HEALTH_LIMITS.weight;
  if (n < min || n > max) return { ok: false, error: 'OUT_OF_RANGE' };
  return { ok: true, value: n };
}

export function parseMedicationDosage(raw: string): MedicationDosageParseResult {
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) return { ok: true, value: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return { ok: false, error: 'INVALID_NUMBER' };
  const { min, max } = HEALTH_LIMITS.medicationDosage;
  if (n < min || n > max) return { ok: false, error: 'OUT_OF_RANGE' };
  return { ok: true, value: n };
}
