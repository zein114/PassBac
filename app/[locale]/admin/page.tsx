'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Users, BookOpen, Activity, Shield, ChevronRight, Settings } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface AdminStats {
    totalUsers: number;
    totalCourses: number;
    totalProgressRecords: number;
}

export default function AdminDashboardOverview() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const ta = useTranslations('Admin');
    const tc = useTranslations('Common');

    useEffect(() => {
        if (!authLoading && !profile?.is_admin) {
            router.push('/dashboard');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!profile?.is_admin) return;

            setLoading(true);

            const [usersRes, coursesRes, progressRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('progress').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                totalUsers: usersRes.count || 0,
                totalCourses: coursesRes.count || 0,
                totalProgressRecords: progressRes.count || 0,
            });

            setLoading(false);
        };

        if (profile?.is_admin) {
            fetchStats();
        }
    }, [profile]);

    if (authLoading || !profile?.is_admin) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: ta('totalUsers'), value: stats?.totalUsers || 0, icon: <Users className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50' },
        { label: ta('totalCourses'), value: stats?.totalCourses || 0, icon: <BookOpen className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50' },
        { label: ta('interactions'), value: stats?.totalProgressRecords || 0, icon: <Activity className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-50' },
    ];

    const managementCards = [
        { title: ta('manageContent'), description: ta('coursesDesc'), href: '/admin/courses', icon: <BookOpen className="w-7 h-7 text-indigo-500" />, bg: 'bg-indigo-50', badge: ta('contentBadge'), badgeBg: 'bg-indigo-100 text-indigo-700' },
        { title: ta('manageUsers'), description: ta('usersDesc'), href: '/admin/users', icon: <Users className="w-7 h-7 text-emerald-500" />, bg: 'bg-emerald-50', badge: ta('accountsBadge'), badgeBg: 'bg-emerald-100 text-emerald-700' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            {/* Hero banner matching user dashboard */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-6 md:p-12 shadow-xl shadow-indigo-200/50">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{ta('portalTitle')}</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-white capitalize">{ta('overviewTitle')}</h1>
                        <p className="text-white/70 mt-2 text-xs md:text-sm max-w-md leading-relaxed">{ta('overviewDesc')}</p>
                    </div>
                    <Link href="/admin/courses" className="flex-shrink-0 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition text-white font-bold px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg text-sm md:text-base">
                        <Settings className="w-5 h-5" /> {ta('manageContent')}
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats exactly like user dashboard */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-4">
                                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                            </div>
                        ) : statCards.map((s, i) => (
                            <div key={i} className="card-hover bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm">
                                <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Management Module cards */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{ta('adminModules')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {managementCards.map((card, i) => (
                                <Link key={i} href={card.href} className="card-hover group block rounded-2xl">
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

                {/* Sidebar area containing system status */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        {ta('systemStatus')}
                    </h2>
                    <div className="card-hover bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{ta('systemsOperational')}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{ta('platformRunning')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm">
                                AI
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{ta('ragServices')}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{ta('documentProcessing')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
