import api from '@/lib/api';
import type { AuthResponse, User } from '@/lib/types';

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/user', { authSilentInvalidation: true });
  return data;
}

export async function postLogin(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/login', { email, password });
  return data;
}

export async function postRegister(
  name: string,
  email: string,
  password: string,
  acceptTermsAndPrivacy: boolean,
  acceptAdult: boolean
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/register', {
    name,
    email,
    password,
    password_confirmation: password,
    accept_terms_and_privacy: acceptTermsAndPrivacy,
    accept_adult: acceptAdult,
  });
  return data;
}

export async function postLogout(): Promise<void> {
  await api.post('/logout');
}

export async function postRequestAccountDeletion(password: string): Promise<void> {
  await api.post('/user/request-deletion', { password });
}
