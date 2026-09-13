import { UserRole } from './auth';

export interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
  type: string;
}

export interface StudentDashboardData {
  username: string;
  role: UserRole;
  available_labs_count: number;
  running_labs_count: number;
  completed_challenges_count: number;
  progress_status_message: string;
  recent_activity: ActivityItem[];
}

export interface InstructorDashboardData {
  username: string;
  role: UserRole;
  total_students_count: number;
  active_students_count: string;
  running_labs_count: string;
  completed_challenges_count: string;
  avg_completion_time: string;
  recent_activity: ActivityItem[];
}

export interface StudentListItem {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}
