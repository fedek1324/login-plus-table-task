import { create } from 'zustand';
import { login as loginApi } from '../api/auth';
import type { LoginResponse } from '../types/auth';

interface AuthState {
  token: string | null;
  user: LoginResponse | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

function getStoredToken(): string | null {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  user: null,
  isLoading: false,
  error: null,

  login: async (username, password, remember) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginApi({ username, password });
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('token', data.accessToken);
      set({ token: data.accessToken, user: data, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    set({ token: null, user: null });
  },

  clearError: () => set({ error: null }),
}));
