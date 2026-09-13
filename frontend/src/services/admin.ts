import { apiRequest } from './api';
import { User, UserRole } from '../types/auth';
import { LabInstructorView } from '../types/lab';

export const getAdminUsers = () => apiRequest<User[]>('/admin/users');
export const createAdminUser = (payload: { username: string; email: string; password: string; role: UserRole }) => apiRequest<User>('/admin/users', { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminUser = (id: string, payload: Partial<{ username: string; email: string; password: string; role: UserRole; is_active: boolean }>) => apiRequest<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteAdminUser = (id: string) => apiRequest<{ detail: string }>(`/admin/users/${id}`, { method: 'DELETE' });
export const getAdminLabs = () => apiRequest<LabInstructorView[]>('/admin/labs');
export const createAdminLab = (payload: { title: string; short_description: string; description: string; category: string; difficulty: string; estimated_duration_minutes: number; learning_objectives: string[]; required_tools: string[]; hints: [] }) => apiRequest<LabInstructorView>('/admin/labs', { method: 'POST', body: JSON.stringify(payload) });
export const renameAdminLab = (id: string, title: string) => apiRequest<LabInstructorView>(`/admin/labs/${id}`, { method: 'PUT', body: JSON.stringify({ title }) });
export const deleteAdminLab = (id: string) => apiRequest<{ detail: string }>(`/admin/labs/${id}`, { method: 'DELETE' });
