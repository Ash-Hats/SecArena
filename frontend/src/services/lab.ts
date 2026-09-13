import { apiRequest } from './api';
import { LabStudentView, LabInstructorView, LabPayload, LabCategory, Difficulty, LabStatus } from '../types/lab';

export async function getStudentCatalogApi(
  category?: LabCategory,
  difficulty?: Difficulty,
  search?: string
): Promise<LabStudentView[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  if (search) params.append('search', search);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<LabStudentView[]>(`/labs${query}`);
}

export async function getStudentLabDetailApi(slugOrId: string): Promise<LabStudentView> {
  return apiRequest<LabStudentView>(`/labs/${encodeURIComponent(slugOrId)}`);
}

export async function getInstructorLabsApi(
  status?: LabStatus,
  category?: LabCategory,
  difficulty?: Difficulty,
  search?: string
): Promise<LabInstructorView[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  if (search) params.append('search', search);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<LabInstructorView[]>(`/labs/manage${query}`);
}

export async function getInstructorLabDetailApi(labId: string): Promise<LabInstructorView> {
  return apiRequest<LabInstructorView>(`/labs/manage/${labId}`);
}

export async function createLabApi(payload: LabPayload): Promise<LabInstructorView> {
  return apiRequest<LabInstructorView>('/labs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateLabApi(labId: string, payload: Partial<LabPayload>): Promise<LabInstructorView> {
  return apiRequest<LabInstructorView>(`/labs/manage/${labId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteLabApi(labId: string): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>(`/labs/manage/${labId}`, {
    method: 'DELETE',
  });
}

export async function publishLabApi(labId: string): Promise<LabInstructorView> {
  return apiRequest<LabInstructorView>(`/labs/manage/${labId}/publish`, {
    method: 'POST',
  });
}

export async function unpublishLabApi(labId: string): Promise<LabInstructorView> {
  return apiRequest<LabInstructorView>(`/labs/manage/${labId}/unpublish`, {
    method: 'POST',
  });
}

export async function archiveLabApi(labId: string): Promise<LabInstructorView> {
  return apiRequest<LabInstructorView>(`/labs/manage/${labId}/archive`, {
    method: 'POST',
  });
}
