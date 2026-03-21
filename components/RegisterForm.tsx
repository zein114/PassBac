'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, GraduationCap } from 'lucide-react';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentType, setStudentType] = useState<'C' | 'D' | ''>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentType) { setError('Please select your Baccalaureate type.'); return; }
        setLoading(true);
        setError(null);
        setSuccess(null);

        // 1. Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // 2. Insert profile with student_type
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                email: data.user.email,
                student_type: studentType,
            });

            if (profileError) {
                setError('Account created but failed to save profile. Please contact support.');
                setLoading(false);
                return;
            }
        }

        setSuccess('Account created! Redirecting to sign in...');
        setLoading(false);
        setTimeout(() => router.push('/login'), 2000);
    };

    return (
        <div className="w-full">
            <form className="space-y-5" onSubmit={handleRegister}>
                {/* Bac Type selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Baccalaureate Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['C', 'D'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setStudentType(type)}
                                className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${studentType === type
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                    }`}
                            >
                                <GraduationCap className={`w-6 h-6 ${studentType === type ? 'text-indigo-500' : 'text-gray-400'}`} />
                                <span className="font-bold text-lg">Bac {type}</span>
                                <span className="text-xs text-center opacity-70">
                                    {type === 'C' ? 'Mathematics & Physics' : 'Biology & Chemistry'}
                                </span>
                                {studentType === type && (
                                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

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
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className="input-modern pl-10"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="text-green-700 text-sm font-medium bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                        {success}
                    </div>
                )}

                <button type="submit" disabled={loading || !!success} className="btn-primary flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create account'}
                </button>
            </form>
        </div>
    );
}
