import { LabStudentView } from './lab';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export interface TrainingEvent {
  id: string;
  title: string;
  description: string;
  join_code: string;
  status: EventStatus;
  starts_at: string;
  ends_at: string;
  capacity?: number;
  author_id: string;
  created_at: string;
  labs: LabStudentView[];
  enrollment_count: number;
  is_enrolled?: boolean;
}

export interface TrainingEventPayload {
  title: string;
  description: string;
  join_code: string;
  starts_at: string;
  ends_at: string;
  capacity?: number;
  lab_ids: string[];
}
