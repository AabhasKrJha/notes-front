export type UserRole = "admin" | "user";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login?: string | null;
}

export interface Note {
  id: number;
  title: string;
  description: string | null;
  user_id: number;
  tags: string[];
  attachments: string[];
  pinned: boolean;
  favorite: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface NoteWithOwner extends Note {
  owner: User;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface NoteCreate {
  title: string;
  description?: string | null;
  tags?: string[];
  attachments?: string[];
  pinned?: boolean;
  favorite?: boolean;
}

export interface NoteUpdate {
  title?: string;
  description?: string | null;
  tags?: string[];
  attachments?: string[];
  pinned?: boolean;
  favorite?: boolean;
}

export interface NoteFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface AdminUserSummary {
  name: string;
  email: string;
  note_count: number;
  created_at: string;
  last_login?: string | null;
  is_monthly_active: boolean;
  is_yearly_active: boolean;
}

export interface AdminTimelinePoint {
  label: string;
  count: number;
}

export interface AdminTimeline {
  weekly: AdminTimelinePoint[];
  monthly: AdminTimelinePoint[];
  yearly: AdminTimelinePoint[];
}

export interface AdminStats {
  total_users: number;
  total_notes: number;
  notes_last_7_days: number;
  notes_last_30_days: number;
  notes_last_365_days: number;
  monthly_active_users: number;
  annual_active_users: number;
  users: AdminUserSummary[];
}

export interface AdminAnalytics {
  notes_per_tag: { tag: string; count: number }[];
  weekly_activity: { label: string; count: number }[];
  top_users: { name: string; email: string; note_count: number }[];
  notes_timeline: AdminTimeline;
  users_timeline: AdminTimeline;
}
