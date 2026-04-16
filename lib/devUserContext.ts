import type { User } from '@/lib/types';

/**
 * Snapshot of the authenticated user for non-React modules (errorHelper, network).
 * Updated from AuthProvider when `user` changes.
 */
let snapshot: User | null = null;

export function setDevUserSnapshot(user: User | null): void {
  snapshot = user;
}

export function getDevUserSnapshot(): User | null {
  return snapshot;
}
