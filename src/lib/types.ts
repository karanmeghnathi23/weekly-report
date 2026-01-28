export type Role = 'admin' | 'lead' | 'member';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    committee: string;
    avatar_url?: string;
}

export interface WeeklyReport {
    id: string;
    user_id: string;
    user_name: string; // Denormalized for simpler list views
    committee: string;
    week_start_date: string; // ISO Date YYYY-MM-DD
    summary: string;
    challenges: string;
    plans_for_next_week: string;
    remarks?: string;
    created_at: string;
    status: 'submitted' | 'reviewed';
}
