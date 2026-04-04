const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthEmailError = 'INVALID_EMAIL';

export type ParseAuthEmailResult =
  | { ok: true; value: string }
  | { ok: false; error: AuthEmailError };

/** Normalizes to trimmed lowercase when valid. */
export function parseAuthEmail(raw: string): ParseAuthEmailResult {
  const trimmed = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) return { ok: false, error: 'INVALID_EMAIL' };
  return { ok: true, value: trimmed };
}

export function isValidAuthEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
