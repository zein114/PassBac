'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, GraduationCap, Eye, EyeOff } from 'lucide-react';

import { useTranslations } from 'next-intl';

export default function RegisterForm() {
    const t = useTranslations('Auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentType, setStudentType] = useState<'C' | 'D' | ''>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentType) { setError(t('selectSeriesError')); return; }
        setLoading(true);
        setError(null);
        setSuccess(null);

        // 1. Sign up the user (metadata is used by the database trigger for profile creation)
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { student_type: studentType }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // 2. Profile is now handled by the database trigger!
        setSuccess(t('accountCreated'));
        setLoading(false);
        setTimeout(() => router.push('/login'), 2000);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form className="space-y-6" onSubmit={handleRegister}>
                {/* Bac Type selector */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {t('studentType')}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {(['C', 'D'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setStudentType(type)}
                                className={`group relative flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all duration-300 ${studentType === type
                                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100 ring-4 ring-indigo-500/10'
                                    : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50/50 text-gray-500'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${studentType === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <span className={`font-bold text-lg ${studentType === type ? 'text-gray-900' : 'text-gray-600'}`}>Bac {type}</span>
                                <span className="text-[10px] text-center font-medium opacity-60 leading-tight px-1">
                                    {type === 'C' ? t('seriesC') : t('seriesD')}
                                </span>
                                {studentType === type && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 pl-1">{t('email')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                dir="ltr"
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-left"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 pl-1">{t('password')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                dir="ltr"
                                className="block w-full pl-11 pr-12 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-left"
                                placeholder="Min. 6 characters"
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
                </div>

                {error && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !!success}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>{t('startLearning')}</>
                    )}
                </button>
            </form>
        </div>
    );
}
