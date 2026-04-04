import axios, { isAxiosError } from 'axios';

import { getApiBaseUrl } from '@/lib/constants/network';

export type ConnStatus = 'ok' | 'warning' | 'error';

/**
 * Dev-only connectivity check (no auth). Used from login screen.
 */
export async function testConnection(): Promise<{ status: ConnStatus; detail: string }> {
  const url = `${getApiBaseUrl()}/health`;
  try {
    const start = Date.now();
    const { data, status } = await axios.get(url, { timeout: 5000 });
    const ms = Date.now() - start;
    const devDetail = `${status} OK (${ms}ms)\n${url}\n${JSON.stringify(data)}`;
    return { status: ms > 3000 ? 'warning' : 'ok', detail: devDetail };
  } catch (e: unknown) {
    if (isAxiosError(e) && e.response) {
      const devDetail = `HTTP ${e.response.status}\n${url}\n${JSON.stringify(e.response.data)}`;
      return { status: 'warning', detail: devDetail };
    }
    const message = e instanceof Error ? e.message : 'Unknown error';
    const devDetail = `${message}\n${url}`;
    return { status: 'error', detail: devDetail };
  }
}
