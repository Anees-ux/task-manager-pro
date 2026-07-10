import apiClient from './apiClient';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authService = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', request);
    return data;
  },

  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', request);
    return data;
  },
};
