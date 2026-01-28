import { WeeklyReport, UserProfile } from './types';
import { supabase } from './supabase';

// Mock Data Removed - Now using Supabase 'leads' table

export const store = {
    // Auth Logic using 'leads' table
    login: async (emailOrUsername: string, password?: string): Promise<{ user: UserProfile | null; error: string | null }> => {
        // We are using 'username' as the login ID now, but keeping the argument name generic
        if (!password) {
            return { user: null, error: 'Password is required' };
        }

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('username', emailOrUsername)
            .eq('password', password)
            .single();

        if (error || !data) {
            return { user: null, error: 'Invalid ID or Password' };
        }

        const user: UserProfile = {
            id: data.id,
            email: data.username, // Using username as email for compatibility or update UserProfile type
            full_name: data.full_name,
            role: data.role as any,
            committee: data.committee
        };

        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return { user, error: null };
    },

    getCurrentUser: (): UserProfile | null => {
        const data = sessionStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    },

    logout: () => {
        sessionStorage.removeItem('currentUser');
    },

    // Report Operations via Supabase
    getReports: async (user?: UserProfile | null): Promise<WeeklyReport[]> => {
        let query = supabase
            .from('weekly_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (user && user.role !== 'admin') {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching reports:', error);
            return [];
        }

        return data as WeeklyReport[];
    },


    submitReport: async (reportData: Omit<WeeklyReport, 'id' | 'created_at' | 'status'>): Promise<{ data: WeeklyReport | null; error: string | null }> => {
        const newReport = {
            ...reportData,
            status: 'submitted'
        };

        const { data, error } = await supabase
            .from('weekly_reports')
            .insert([newReport])
            .select()
            .single();

        if (error) {
            console.error('Error submitting report:', error);
            return { data: null, error: error.message };
        }

        return { data: data as WeeklyReport, error: null };
    },

    updateReportStatus: async (reportId: string, status: WeeklyReport['status']): Promise<void> => {
        const { error } = await supabase
            .from('weekly_reports')
            .update({ status })
            .eq('id', reportId);

        if (error) {
            console.error('Error updating status:', error);
        }
    },

    deleteReport: async (reportId: string): Promise<void> => {
        const { error } = await supabase
            .from('weekly_reports')
            .delete()
            .eq('id', reportId);

        if (error) {
            console.error('Error deleting report:', error);
        }
    }
};
