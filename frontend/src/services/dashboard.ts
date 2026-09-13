import { apiRequest } from './api';
import { StudentDashboardData, InstructorDashboardData, StudentListItem } from '../types/dashboard';

export async function getStudentDashboardApi(): Promise<StudentDashboardData> {
  return apiRequest<StudentDashboardData>('/dashboard/student');
}

export async function getInstructorDashboardApi(): Promise<InstructorDashboardData> {
  return apiRequest<InstructorDashboardData>('/dashboard/instructor');
}

export async function getInstructorStudentsApi(search?: string): Promise<StudentListItem[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest<StudentListItem[]>(`/dashboard/instructor/students${query}`);
}
