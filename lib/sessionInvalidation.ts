type SessionInvalidationHandler = () => void | Promise<void>;

let handler: SessionInvalidationHandler | null = null;

let lastNotifyAt = 0;
const THROTTLE_MS = 2500;

/** AuthProvider registers this so any 401 from the API clears UI + local session. */
export function setSessionInvalidationHandler(fn: SessionInvalidationHandler | null): void {
  handler = fn;
}

export function notifySessionInvalidated(): void {
  const now = Date.now();
  if (now - lastNotifyAt < THROTTLE_MS) return;
  lastNotifyAt = now;
  void Promise.resolve(handler?.());
}
