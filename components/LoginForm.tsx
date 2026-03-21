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

        const { error, data } = await supabase.auth.signInWithPassword({
            email: demoEmail || email,
            password: demoPassword || password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Check for 'next' param in URL
            const searchParams = new URLSearchParams(window.location.search);
            const next = searchParams.get('next') || '/dashboard';
            router.refresh();
            router.push(next);
        }
    };

    return (
        <div className="w-full space-y-6">
            <form className="space-y-5" onSubmit={handleLogin}>
                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                        <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
                            Forgot?
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>Sign in to Dashboard</>
                    )}
                </button>
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-400 font-bold tracking-widest">OR</span>
                </div>
            </div>

            <button
                onClick={() => handleLogin(undefined, 'demo@test.com', 'demo')}
                disabled={loading}
                className="w-full py-3 px-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-indigo-100 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group transform active:scale-[0.98]"
            >
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                    <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                Continue with Demo Access
            </button>
        </div>
    );
}
