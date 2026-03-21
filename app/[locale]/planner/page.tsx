'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Plus, Sparkles, CheckCircle2, Circle, Clock, Trash2, Loader2, BookOpen } from 'lucide-react';

interface Session {
    id: string;
    title: string;
    subject: string;
    date: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'completed';
}

export default function PlannerPage({ params }: { params: Promise<{ locale: string }> }) {
    const t = useTranslations();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [newSession, setNewSession] = useState({
        title: '',
        subject: 'Mathematics',
        date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '10:00'
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/planner');
            const data = await res.json();
            setSessions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSession)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchSessions();
                setNewSession({ ...newSession, title: '' });
            }
        } catch (error) {
            console.error('Failed to add session', error);
        }
    };

    const toggleStatus = async (session: Session) => {
        const newStatus = session.status === 'pending' ? 'completed' : 'pending';
        try {
            const res = await fetch('/api/planner', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: session.id, status: newStatus })
            });
            if (res.ok) {
                setSessions(sessions.map(s => s.id === session.id ? { ...s, status: newStatus } : s));
            }
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const deleteSession = async (id: string) => {
        try {
            const res = await fetch(`/api/planner?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSessions(sessions.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete session', error);
        }
    };

    const generateWithAI = async () => {
        setIsGenerating(true);
        try {
            // Get the actual locale string
            const { locale } = await params;
            const res = await fetch('/api/planner/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale })
            });
            if (res.ok) {
                fetchSessions();
            } else {
                const err = await res.json();
                console.error('AI generation failed:', err.error);
                alert('Generation error: ' + err.error);
            }
        } catch (error) {
            console.error('AI generation network error', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Group sessions by date
    const groupedSessions = sessions.reduce((groups: Record<string, Session[]>, session) => {
        const date = session.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(session);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedSessions).sort();

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                        {t('Planner.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('Planner.description')}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={generateWithAI}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {t('Planner.generatePlan')}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-sm flex-1 sm:flex-none"
                    >
                        <Plus className="w-5 h-5" />
                        {t('Planner.addSession')}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500">{t('Planner.empty')}</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-600 font-medium mt-2 hover:underline"
                    >
                        {t('Planner.addSession')}
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map(date => (
                        <div key={date} className="relative">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h2>
                            <div className="grid gap-3">
                                {groupedSessions[date].map(session => (
                                    <div
                                        key={session.id}
                                        className={`group flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all hover:shadow-md ${session.status === 'completed' ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleStatus(session)}
                                            className={`flex-shrink-0 transition-transform active:scale-90 ${session.status === 'completed' ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'
                                                }`}
                                        >
                                            {session.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                        </button>

                                        <div className="flex-grow">
                                            <h3 className={`font-semibold ${session.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                {session.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                <span className={`px-2 py-0.5 rounded-md ${session.subject === 'Mathematics' ? 'bg-indigo-50 text-indigo-600' :
                                                    session.subject === 'Physics' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                    {t(`Common.subjects.${session.subject.toLowerCase()}`)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteSession(session.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Simple */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">{t('Planner.addSession')}</h2>
                        <form onSubmit={handleAddSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('Planner.form.title')}</label>
                                <input
                                    required
                                    value={newSession.title}
                                    onChange={e => setNewSession({ ...newSession, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Planner.form.subject')}</label>
                                    <select
                                        value={newSession.subject}
                                        onChange={e => setNewSession({ ...newSession, subject: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Mathematics">{t('Common.subjects.mathematics')}</option>
                                        <option value="Physics">{t('Common.subjects.physics')}</option>
                                        <option value="Science">{t('Common.subjects.science')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Planner.form.date')}</label>
                                    <input
                                        type="date"
                                        value={newSession.date}
                                        onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Planner.form.startTime')}</label>
                                    <input
                                        type="time"
                                        value={newSession.start_time}
                                        onChange={e => setNewSession({ ...newSession, start_time: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Planner.form.endTime')}</label>
                                    <input
                                        type="time"
                                        value={newSession.end_time}
                                        onChange={e => setNewSession({ ...newSession, end_time: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    {t('Common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    {t('Common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
