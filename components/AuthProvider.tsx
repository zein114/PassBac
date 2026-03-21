'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export interface Profile {
    id: string;
    email: string;
    student_type: 'C' | 'D' | null;
    is_admin: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    const loadProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data ?? null);
    };

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) await loadProfile(currentUser.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await loadProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            if (_event === 'SIGNED_OUT') router.push('/login');
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        // 1. Call server-side signout to clear cookies
        await fetch('/api/auth/signout', { method: 'POST' });
        // 2. Clear client-side session just in case
        await supabase.auth.signOut();
        // 3. Force a full page reload to /login for a clean state
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
