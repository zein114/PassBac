'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, MessageSquare, Brain, TrendingUp, Sparkles, ChevronRight, Award } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface Stats {
    courseCount: number;
    quizzesTaken: number;
    correctAnswers: number;
    totalQuestions: number;
}

export default function Dashboard() {
    const { user, profile, loading } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (!user || !profile) return;
        const supabase = createClient();
        Promise.all([
            supabase.from('courses').select('*', { count: 'exact', head: true }).eq('student_type', profile.student_type),
            supabase.from('progress').select('*').eq('user_id', user.id).single(),
        ]).then(([coursesRes, progressRes]) => {
            setStats({
                courseCount: coursesRes.count ?? 0,
                quizzesTaken: progressRes.data?.quizzes_taken ?? 0,
                correctAnswers: progressRes.data?.correct_answers ?? 0,
                totalQuestions: progressRes.data?.total_questions ?? 0,
            });
            setStatsLoading(false);
        });
    }, [user, profile]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );
    if (!user || !profile) return null;

    const firstName = profile.email?.split('@')[0] ?? 'Student';
    const successRate = stats && stats.totalQuestions > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;

    const cards = [
        { title: 'My Courses', description: 'Browse materials for your Bac type.', href: '/courses', icon: <BookOpen className="w-7 h-7 text-indigo-500" />, bg: 'bg-indigo-50', badge: `Bac ${profile.student_type}`, badgeBg: 'bg-indigo-100 text-indigo-700' },
        { title: 'Ask AI', description: 'Chat with your personal AI tutor.', href: '/ai', icon: <MessageSquare className="w-7 h-7 text-purple-500" />, bg: 'bg-purple-50', badge: 'Teacher Mode', badgeBg: 'bg-purple-100 text-purple-700' },
        { title: 'AI Quiz', description: 'Generate a quiz from your courses.', href: '/quiz', icon: <Brain className="w-7 h-7 text-cyan-500" />, bg: 'bg-cyan-50', badge: 'AI Generated', badgeBg: 'bg-cyan-100 text-cyan-700' },
    ];

    const statCards = [
        { label: 'Available Courses', value: statsLoading ? '…' : String(stats?.courseCount ?? 0), icon: <BookOpen className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50' },
        { label: 'Quizzes Taken', value: statsLoading ? '…' : String(stats?.quizzesTaken ?? 0), icon: <Brain className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
        { label: 'Correct Answers', value: statsLoading ? '…' : String(stats?.correctAnswers ?? 0), icon: <Award className="w-5 h-5 text-cyan-500" />, bg: 'bg-cyan-50' },
        { label: 'Success Rate', value: statsLoading ? '…' : `${successRate}%`, icon: <TrendingUp className="w-5 h-5 text-green-500" />, bg: 'bg-green-50' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            {/* Hero banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-8 md:p-12 shadow-xl shadow-indigo-200/50">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Bac {profile.student_type}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white capitalize">Welcome, {firstName}!</h1>
                        <p className="text-white/60 mt-2 text-sm max-w-md">Your personalized Baccalaureate prep platform is ready. Start learning, ask your AI tutor, and practice with real quizzes.</p>
                    </div>
                    <Link href="/ai" className="flex-shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 transition text-white font-semibold px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/30 shadow">
                        <Sparkles className="w-5 h-5" /> Ask AI now
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200/80 p-4 flex items-center gap-3 shadow-sm">
                        <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                        <div>
                            <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Module cards */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {cards.map((card, i) => (
                        <Link key={i} href={card.href} className="card-hover group">
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 h-full flex flex-col">
                                <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center mb-5`}>{card.icon}</div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-3 ${card.badgeBg}`}>{card.badge}</span>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                                <p className="text-sm text-gray-500 flex-grow">{card.description}</p>
                                <div className="flex items-center gap-1 mt-4 text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
                                    Open <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
