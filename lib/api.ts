import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { getApiBaseUrl } from '@/lib/constants/network';
import {
  isUserSessionActive,
  notifySessionInvalidated,
  setUserSessionActive,
} from '@/lib/sessionInvalidation';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const silent = Boolean(error.config?.authSilentInvalidation);
      const showSessionEndedAlert = !silent && isUserSessionActive();
      await SecureStore.deleteItemAsync('auth_token');
      if (showSessionEndedAlert) {
        // Backend may send { code: "SESSION_REVOKED" } when this device was superseded (EnsureMobileSessionIsActive).
        notifySessionInvalidated();
      }
      setUserSessionActive(false);
    }
    return Promise.reject(error);
  }
);

export default api;
