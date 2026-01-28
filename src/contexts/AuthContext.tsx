import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../lib/types';
import { store } from '../lib/store';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password?: string) => Promise<string | null>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkUser = async () => {
            try {
                const curentUser = store.getCurrentUser();
                if (curentUser) {
                    setUser(curentUser);
                }
            } catch (e) {
                console.error("Auth init error", e);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const signIn = async (email: string, password?: string) => {
        setLoading(true);
        try {
            const { user, error } = await store.login(email, password);
            if (error) {
                return error;
            }
            setUser(user);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        store.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
