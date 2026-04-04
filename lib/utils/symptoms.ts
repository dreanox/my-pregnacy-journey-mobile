import { DEFAULT_SYMPTOMS } from '@/lib/types';

const PRESET = new Set<string>(DEFAULT_SYMPTOMS as readonly string[]);

export function isPresetSymptom(name: string): boolean {
  return PRESET.has(name);
}
