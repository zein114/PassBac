'use client';

import { Link, useRouter } from '@/i18n/navigation';
import RegisterForm from '@/components/RegisterForm';
import { useAuth } from '@/components/AuthProvider';
import { useEffect } from 'react';
import { BookOpenCheck, Sparkles, Brain } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const t = useTranslations('Auth');
    const tc = useTranslations('Common');

    useEffect(() => {
        if (user) router.push('/dashboard');
    }, [user, router]);

    if (loading || user) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500">
            <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex-col justify-between p-12 text-white">
                <div className="flex items-center gap-3">
                    <BookOpenCheck className="w-8 h-8" />
                    <span className="text-xl font-bold">{tc('title')}</span>
                </div>
                <div>
                    <h1 className="text-5xl font-extrabold leading-tight mb-6">
                        {t('registerLandingTitle')}
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed max-w-md">
                        {t('registerLandingDescription')}
                    </p>
                    <div className="flex gap-6 mt-10">
                        {[
                            { icon: <Brain className="w-5 h-5" />, label: t('featureAiAssistant') },
                            { icon: <Sparkles className="w-5 h-5" />, label: t('featureSmartQuizzes') },
                            { icon: <BookOpenCheck className="w-5 h-5" />, label: t('featureUploadPdfs') }
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium border border-white/10 shadow-sm">
                                {f.icon}{f.label}
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-white/40 text-sm">© 2026 {tc('title')}. All rights reserved.</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <BookOpenCheck className="w-7 h-7 text-indigo-600" />
                        <span className="font-bold text-xl text-gray-800">{tc('title')}</span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900">{t('register')}</h2>
                    <p className="mt-2 text-gray-500 text-sm">{t('registerLandingSubtext')}</p>

                    <div className="mt-8 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                        <RegisterForm />
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        {t('hasAccount')}{' '}
                        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            {t('login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
