import type { LoginRequest, LoginResponse } from '../types/auth';

const BASE_URL = 'https://dummyjson.com';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ошибка авторизации');
  }

  return response.json();
}
