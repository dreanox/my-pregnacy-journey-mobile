import Constants from 'expo-constants';

import { getDevUserSnapshot } from '@/lib/devUserContext';
import type { User } from '@/lib/types';

/**
 * Reads a toggle from `user.feature_flags` (JSON from the backend). Flag names are not
 * enumerated in TypeScript—the API is the source of truth; pass the same string the server uses.
 */
export function hasFeatureFlag(user: User | null | undefined, key: string): boolean {
  const flags = user?.feature_flags;
  if (!flags || typeof flags !== 'object') return false;
  return flags[key] === true;
}

export function isDeveloperAccount(user: User | null | undefined): boolean {
  return user?.is_developer === true;
}

/** Local __DEV__ or server `is_developer`. */
export function hasDevCapabilities(user: User | null | undefined): boolean {
  return __DEV__ || isDeveloperAccount(user);
}

/** Flag keys here must match what the backend stores (e.g. `debug_photo_load`, `debug_menu`). */
export function showPhotoLoadDiagnostics(user: User | null | undefined): boolean {
  return (
    __DEV__ ||
    hasDevCapabilities(user) ||
    hasFeatureFlag(user, 'debug_photo_load') ||
    hasFeatureFlag(user, 'debug_menu')
  );
}

export function showVerboseApiErrors(user: User | null | undefined): boolean {
  return (
    __DEV__ ||
    hasDevCapabilities(user) ||
    hasFeatureFlag(user, 'verbose_api_errors') ||
    hasFeatureFlag(user, 'debug_menu')
  );
}

export function showTestApiConnection(user: User | null | undefined): boolean {
  return (
    __DEV__ ||
    hasDevCapabilities(user) ||
    hasFeatureFlag(user, 'test_connect') ||
    hasFeatureFlag(user, 'debug_menu')
  );
}

export function showTimelineDateDebug(user: User | null | undefined): boolean {
  return __DEV__ || hasDevCapabilities(user) || hasFeatureFlag(user, 'debug_menu');
}

/**
 * Test API on login when there is no user yet. `extra.showLoginApiTest` in app.json for internal builds.
 */
export function shouldShowLoginScreenApiTest(): boolean {
  if (__DEV__) return true;
  const extra = Constants.expoConfig?.extra as { showLoginApiTest?: boolean } | undefined;
  return extra?.showLoginApiTest === true;
}

export function showVerboseApiErrorsForCurrentUser(): boolean {
  return showVerboseApiErrors(getDevUserSnapshot());
}
