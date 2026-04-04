import axios from 'axios';
import { Alert } from 'react-native';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function showError(title: string, error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    if (__DEV__) {
      const status = error.response?.status ?? 'N/A';
      const url = error.config?.url ?? 'unknown';
      const method = (error.config?.method ?? 'unknown').toUpperCase();
      const data = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message ?? 'No response';

      Alert.alert(
        `${title} [DEV]`,
        `${method} ${url}\nStatus: ${status}\n\n${data}`,
      );
      return;
    }

    const body = error.response?.data;
    let msg = fallbackMessage;
    if (isRecord(body) && 'errors' in body && body.errors) {
      const errs = body.errors;
      if (isRecord(errs)) {
        msg = Object.values(errs)
          .flat()
          .filter((x): x is string => typeof x === 'string')
          .join('\n');
      }
    } else if (isRecord(body) && typeof body.message === 'string') {
      msg = body.message;
    }

    Alert.alert(title, msg);
    return;
  }

  if (__DEV__) {
    Alert.alert(`${title} [DEV]`, String(error));
    return;
  }

  Alert.alert(title, fallbackMessage);
}
