'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Zap, Loader2, Eye, EyeOff } from 'lucide-react';

import { useTranslations } from 'next-intl';

export default function LoginForm() {
    const t = useTranslations('Auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email')}</label>
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
                        <label className="block text-sm font-semibold text-gray-700">{t('password')}</label>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-12 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
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
                        <>{t('signInToDashboard')}</>
                    )}
                </button>
            </form>
        </div>
    );
}
