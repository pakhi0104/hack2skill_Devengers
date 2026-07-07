export interface Profile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  state?: string;
  city?: string;
  occupation?: string;
  education?: string;
  income_range?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export type Theme = 'light' | 'dark' | 'system';

export type OccupationType =
  | 'Student'
  | 'Employee'
  | 'Farmer'
  | 'Business Owner'
  | 'Homemaker'
  | 'Retired'
  | 'Other';

export type CategoryType =
  | 'General'
  | 'OBC'
  | 'SC'
  | 'ST'
  | 'EWS'
  | 'Prefer not to say';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

// Phase 3 Types
export interface SavedScheme {
  id: string;
  user_id: string;
  scheme_name: string;
  provider?: string;
  category?: string;
  official_url?: string;
  match_score: number;
  summary?: string;
  scheme_details?: Record<string, any>;
  saved_at: string;
}

export type ApplicationStatus =
  | 'Not Started'
  | 'Preparing Documents'
  | 'Applied'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Closed';

export interface Application {
  id: string;
  user_id: string;
  scheme_name: string;
  provider?: string;
  category?: string;
  official_url?: string;
  current_status: ApplicationStatus;
  progress_percentage: number;
  match_score: number;
  scheme_details?: Record<string, any>;
  started_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_name: string;
  completed: boolean;
  updated_at: string;
}

export type NotificationType =
  | 'Application Reminder'
  | 'Deadline Reminder'
  | 'Missing Documents'
  | 'Saved Scheme Updates'
  | 'New Matching Scheme'
  | 'General Updates';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: NotificationType;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  category: string;
  query: string;
  extra_answers?: Record<string, any>;
  results_count?: number;
  recommendation_summary?: string;
  created_at: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
