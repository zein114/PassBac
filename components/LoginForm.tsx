'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Zap, Loader2 } from 'lucide-react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e?: React.FormEvent, demoEmail?: string, demoPassword?: string) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: demoEmail || email,
            password: demoPassword || password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.refresh();
            router.push('/dashboard');
        }
    };

    return (
        <div className="w-full space-y-4">
            <form className="space-y-4" onSubmit={handleLogin}>
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="input-modern pl-10"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-modern pl-10"
                        />
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
                </button>
            </form>

            {/* Divider */}
            <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-400 font-medium">Or</span>
                </div>
            </div>

            {/* Demo button */}
            <button
                onClick={() => handleLogin(undefined, 'demo@test.com', 'demo')}
                disabled={loading}
                className="btn-secondary flex items-center justify-center gap-2"
            >
                <Zap className="w-4 h-4 text-yellow-500" />
                Login as Demo
            </button>
        </div>
    );
}
