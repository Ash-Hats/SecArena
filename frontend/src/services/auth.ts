import { apiRequest } from './api';
import { LoginCredentials, RegisterData, TokenResponse, User } from '../types/auth';

export async function loginApi(credentials: LoginCredentials): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerApi(data: RegisterData): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMeApi(): Promise<User> {
  return apiRequest<User>('/auth/me', {
    method: 'GET',
  });
}

export async function updateProfileApi(data: { username?: string; email?: string }): Promise<User> {
  return apiRequest<User>('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function logoutApi(): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  });
}
