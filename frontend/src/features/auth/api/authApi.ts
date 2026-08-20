import apiClient from '@shared/api/apiClient';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/Auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/Auth/register', data).then((r) => r.data),
};
