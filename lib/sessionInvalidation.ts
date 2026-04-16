type SessionInvalidationHandler = () => void | Promise<void>;

let handler: SessionInvalidationHandler | null = null;

let lastNotifyAt = 0;
const THROTTLE_MS = 2500;

/**
 * True only while the app considers the user logged in (valid session restored or login/register succeeded).
 * Used so 401s on the login screen or after a failed token restore never show the global “session ended” alert.
 */
let userSessionActive = false;

export function setUserSessionActive(active: boolean): void {
  userSessionActive = active;
}

export function isUserSessionActive(): boolean {
  return userSessionActive;
}

/** AuthProvider registers this so any 401 from the API clears UI + local session (incl. SESSION_REVOKED / new login elsewhere). */
export function setSessionInvalidationHandler(fn: SessionInvalidationHandler | null): void {
  handler = fn;
}

export function notifySessionInvalidated(): void {
  const now = Date.now();
  if (now - lastNotifyAt < THROTTLE_MS) return;
  lastNotifyAt = now;
  void Promise.resolve(handler?.());
}
