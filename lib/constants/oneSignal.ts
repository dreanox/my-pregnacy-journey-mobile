/**
 * Mismo App ID que `ONESIGNAL_ID` en Laravel (es público en el cliente).
 * Define `EXPO_PUBLIC_ONESIGNAL_ID` en `.env` del proyecto mobile / EAS.
 */
export function getOneSignalAppId(): string | undefined {
  const v = process.env.EXPO_PUBLIC_ONESIGNAL_ID;
  if (typeof v === 'string' && v.trim() !== '') return v.trim();
  return undefined;
}
