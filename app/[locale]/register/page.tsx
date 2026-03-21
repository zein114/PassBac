'use client';

import { Link, useRouter } from '@/i18n/navigation';
import RegisterForm from '@/components/RegisterForm';
import { useAuth } from '@/components/AuthProvider';
import { useEffect } from 'react';
import { BookOpenCheck, Sparkles, Brain } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from '@/components/LanguageSelector';

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
        <div className="min-h-[100dvh] flex relative overflow-hidden bg-slate-50 w-full">
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
            
            {/* Absolute Language Selector Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <LanguageSelector />
            </div>

            {/* Left panel — brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex-col justify-between p-12 text-white relative overflow-hidden">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-2xl opacity-40 animate-blob" />
                <div className="absolute top-0 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-overlay filter blur-2xl opacity-40 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-80 h-80 bg-fuchsia-300 rounded-full mix-blend-overlay filter blur-2xl opacity-40 animate-blob animation-delay-4000" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 p-1.5">
                        <BookOpenCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">{tc('title')}</span>
                </div>
                
                <div className="relative z-10">
                    <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight drop-shadow-sm">
                        {t('registerLandingTitle')}
                    </h1>
                    <p className="text-white/90 text-lg leading-relaxed max-w-md font-medium">
                        {t('registerLandingDescription')}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-10">
                        {[
                            { icon: <Brain className="w-5 h-5 text-indigo-200" />, label: t('featureAiAssistant') },
                            { icon: <Sparkles className="w-5 h-5 text-purple-200" />, label: t('featureSmartQuizzes') },
                            { icon: <BookOpenCheck className="w-5 h-5 text-cyan-200" />, label: t('featureUploadPdfs') }
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold border border-white/20 shadow-xl transition-transform hover:scale-105">
                                {f.icon}{f.label}
                            </div>
                        ))}
                    </div>
                </div>
                <p className="relative z-10 text-white/50 text-sm font-medium">© {new Date().getFullYear()} {tc('title')}. All rights reserved.</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 py-12 relative z-10">
                <div className="w-full max-w-md mx-auto relative pt-12 lg:pt-0">
                    {/* Mobile logo */}
                    <div className="flex justify-center items-center gap-2 mb-8 lg:hidden">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md p-1">
                            <BookOpenCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-extrabold text-2xl text-gray-900 tracking-tight">{tc('title')}</span>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{t('register')}</h2>
                        <p className="mt-2 text-gray-500 text-sm sm:text-base">{t('registerLandingSubtext')}</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-xl sm:shadow-indigo-100/50 border border-gray-100 p-6 sm:p-8">
                        <RegisterForm />
                    </div>

                    <p className="mt-8 text-center text-sm font-medium text-gray-500">
                        {t('hasAccount')}{' '}
                        <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            {t('login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
