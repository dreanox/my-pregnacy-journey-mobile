/**
 * LAN IP of the machine running the Laravel API (dev). Updated by dev-ip-sync rule.
 * @see `.cursor/rules/dev-ip-sync.mdc`
 */
export const DEV_MACHINE_IP = '192.168.100.51';

/** Production API origin (no path). Release builds (`!__DEV__`) use this + `/api/v1`. */
export const PRODUCTION_API_ORIGIN = 'https://api.pigworlds.com';

const API_V1_SUFFIX = '/api/v1';

export function getApiBaseUrl(): string {
  if (__DEV__) {
    return `http://${DEV_MACHINE_IP}:8000${API_V1_SUFFIX}`;
  }
  return `${PRODUCTION_API_ORIGIN.replace(/\/$/, '')}${API_V1_SUFFIX}`;
}

/** Laravel app origin (no `/api/v1`), for storage URLs and rewriting localhost. */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
}
