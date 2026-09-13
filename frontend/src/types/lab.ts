export type LabCategory = 'WEB' | 'LINUX' | 'NETWORK' | 'API' | 'CLOUD' | 'FORENSICS' | 'OSINT' | 'MOBILE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type LabStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Hint {
  id?: string;
  title: string;
  content: string;
  hint_order: number;
  created_at?: string;
}

export interface LabStudentView {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  category: LabCategory;
  difficulty: Difficulty;
  estimated_duration_minutes: number;
  learning_objectives: string[];
  required_tools: string[];
  hints: Hint[];
}

export interface LabInstructorView {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  category: LabCategory;
  difficulty: Difficulty;
  status: LabStatus;
  estimated_duration_minutes: number;
  learning_objectives: string[];
  required_tools: string[];
  hints: Hint[];
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  archived_at?: string;
}

export type LabInstanceStatus = 'PROVISIONING' | 'RUNNING' | 'STOPPED' | 'FAILED';

export interface LabInstance {
  id: string;
  lab_id: string;
  status: LabInstanceStatus;
  started_at?: string;
  stopped_at?: string;
  expires_at: string;
  failure_reason?: string;
}

export interface LabPayload {
  title: string;
  slug?: string;
  short_description: string;
  description: string;
  category: LabCategory;
  difficulty: Difficulty;
  estimated_duration_minutes: number;
  learning_objectives: string[];
  required_tools: string[];
  hints: Hint[];
}
