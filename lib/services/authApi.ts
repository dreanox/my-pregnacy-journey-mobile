import api from '@/lib/api';
import type { AuthResponse, User } from '@/lib/types';

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/user');
  return data;
}

export async function postLogin(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/login', { email, password });
  return data;
}

export async function postRegister(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/register', {
    name,
    email,
    password,
    password_confirmation: password,
  });
  return data;
}

export async function postLogout(): Promise<void> {
  await api.post('/logout');
}
