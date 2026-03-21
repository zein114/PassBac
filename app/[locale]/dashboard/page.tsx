'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, MessageSquare, Brain, TrendingUp, Sparkles, ChevronRight, Award, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';

interface Stats {
    courseCount: number;
    quizzesTaken: number;
    correctAnswers: number;
    totalQuestions: number;
}

interface Session {
    id: string;
    title: string;
    subject: string;
    start_time: string;
    status: 'pending' | 'completed';
}

export default function Dashboard() {
    const t = useTranslations('Dashboard');
    const tc = useTranslations('Common');
    const { user, profile, loading } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [todaySessions, setTodaySessions] = useState<Session[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (!user || !profile) return;
        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];

        Promise.all([
            supabase.from('courses').select('*', { count: 'exact', head: true }).eq('student_type', profile.student_type),
            supabase.from('progress').select('*').eq('user_id', user.id).single(),
            supabase.from('study_sessions').select('*').eq('user_id', user.id).eq('date', today).limit(3)
        ]).then(([coursesRes, progressRes, sessionsRes]) => {
            setStats({
                courseCount: coursesRes.count ?? 0,
                quizzesTaken: progressRes.data?.quizzes_taken ?? 0,
                correctAnswers: progressRes.data?.correct_answers ?? 0,
                totalQuestions: progressRes.data?.total_questions ?? 0,
            });
            setTodaySessions(sessionsRes.data || []);
            setStatsLoading(false);
        });
    }, [user, profile]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );
    if (!user || !profile) return null;

    const firstName = user.email?.split('@')[0] ?? 'Student';
    const successRate = stats && stats.totalQuestions > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;

    const cards = [
        { title: tc('courses'), description: t('modules.coursesDesc'), href: '/courses', icon: <BookOpen className="w-7 h-7 text-indigo-500" />, bg: 'bg-indigo-50', badge: `Bac ${profile.student_type}`, badgeBg: 'bg-indigo-100 text-indigo-700' },
        { title: tc('aiTutor'), description: t('modules.aiDesc'), href: '/ai', icon: <MessageSquare className="w-7 h-7 text-purple-500" />, bg: 'bg-purple-50', badge: t('stats.teacherMode'), badgeBg: 'bg-purple-100 text-purple-700' },
        { title: tc('quiz'), description: t('modules.quizDesc'), href: '/quiz', icon: <Brain className="w-7 h-7 text-cyan-500" />, bg: 'bg-cyan-50', badge: t('stats.aiGenerated'), badgeBg: 'bg-cyan-100 text-cyan-700' },
    ];

    const statCards = [
        { label: t('stats.courses'), value: statsLoading ? '…' : String(stats?.courseCount ?? 0), icon: <BookOpen className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50' },
        { label: t('stats.quizzes'), value: statsLoading ? '…' : String(stats?.quizzesTaken ?? 0), icon: <Brain className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
        { label: t('stats.accuracy'), value: statsLoading ? '…' : `${successRate}%`, icon: <TrendingUp className="w-5 h-5 text-green-500" />, bg: 'bg-green-50' },
        { label: t('stats.sessions'), value: String(todaySessions.length), icon: <Calendar className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            {/* Hero banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-6 md:p-12 shadow-xl shadow-indigo-200/50">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Bac {profile.student_type}</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-white capitalize">{t('welcome')}, {firstName}!</h1>
                        <p className="text-white/70 mt-2 text-xs md:text-sm max-w-md leading-relaxed">{t('heroDescription')}</p>
                    </div>
                    <Link href="/ai" className="flex-shrink-0 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition text-white font-bold px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg text-sm md:text-base">
                        <Sparkles className="w-5 h-5" /> {t('askAiNow')}
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {statCards.map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm">
                                <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Module cards */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('modules.title')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {cards.map((card, i) => (
                                <Link key={i} href={card.href} className="card-hover group">
                                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 h-full flex flex-col">
                                        <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center mb-5`}>{card.icon}</div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-3 ${card.badgeBg}`}>{card.badge}</span>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                                        <p className="text-sm text-gray-500 flex-grow">{card.description}</p>
                                        <div className="flex items-center gap-1 mt-4 text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
                                            {tc('open')} <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Today's Schedule Sidebar */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        {t('todaySchedule')}
                    </h2>
                    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 space-y-4">
                        {todaySessions.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-sm text-gray-500 mb-4">{t('noSessions')}</p>
                                <Link href="/planner" className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                                    {t('openPlanner')}
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todaySessions.map((s) => (
                                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm">
                                            {s.start_time.slice(0, 5)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{s.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{tc(`subjects.${s.subject.toLowerCase()}`)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
                                    Aller au planning
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {todaySessions.map(session => (
                                        <div key={session.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex-shrink-0">
                                                {session.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-orange-400" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-bold truncate ${session.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{session.title}</p>
                                                <p className="text-[10px] text-slate-500 font-medium capitalize">{session.subject} • {session.start_time.slice(0, 5)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/planner" className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors border-t border-slate-100 mt-2">
                                    Voir tout le planning <ChevronRight className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
