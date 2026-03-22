'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import { FileText, BookOpen, Cpu, Search } from 'lucide-react';
import Link from 'next/link';

interface Course {
    id: string;
    title: string;
    subject: string;
    student_type: string;
    pdf_url: string;
}

const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: 'bg-indigo-100 text-indigo-700',
    Physics: 'bg-rose-100 text-rose-700',
    Science: 'bg-emerald-100 text-emerald-700',
};
const SUBJECT_BARS: Record<string, string> = {
    Mathematics: 'bg-indigo-400',
    Physics: 'bg-rose-400',
    Science: 'bg-emerald-400',
};

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Science'];

import { useTranslations } from 'next-intl';

export default function CoursesPage() {
    const t = useTranslations('Courses');
    const tc = useTranslations('Common');
    const { profile } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [filtered, setFiltered] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState('All');
    const [search, setSearch] = useState('');
    const supabase = createClient();

    const SUBJECTS = [
        { id: 'All', label: tc('subjects.all') },
        { id: 'Mathematics', label: tc('subjects.mathematics') },
        { id: 'Physics', label: tc('subjects.physics') },
        { id: 'Science', label: tc('subjects.science') },
    ];

    useEffect(() => {
        if (!profile) return;
        setLoading(true);
        supabase
            .from('courses')
            .select('*')
            .eq('student_type', profile.student_type)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setCourses(data || []);
                setFiltered(data || []);
                setLoading(false);
            });
    }, [profile]);

    useEffect(() => {
        let result = courses;
        if (subject !== 'All') result = result.filter(c => c.subject === subject);
        if (search.trim()) result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
        setFiltered(result);
    }, [subject, search, courses]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                    {t('title', { type: profile?.student_type || 'General' })}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    {t('description')}
                </p>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="block w-full py-3 pe-4 ps-11 text-sm text-gray-900 border-[1.5px] border-gray-200 rounded-2xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-sm outline-none"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {SUBJECTS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSubject(s.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${subject === s.id ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-400'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Courses grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-bold">{t('noCoursesFound')}</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {courses.length === 0
                            ? t('emptyMaterials')
                            : t('adjustFilter')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((course) => (
                        <div key={course.id} className="card-hover bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
                            <div className={`h-1.5 w-full ${SUBJECT_BARS[course.subject] || 'bg-gray-300'}`} />
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SUBJECT_COLORS[course.subject] || 'bg-gray-100 text-gray-700'}`}>
                                        {tc(`subjects.${course.subject.toLowerCase()}`)}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">{t('pdfDocument')}</span>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1 flex-grow">{course.title}</h3>
                                <div className="flex items-center text-xs text-gray-400 mt-2">
                                    <FileText className="w-3.5 h-3.5 mr-1" /> {t('pdfDocument')}
                                </div>
                            </div>
                            <div className="border-t border-gray-100 px-5 py-3 flex justify-between items-center bg-gray-50/50">
                                <a
                                    href={`${course.pdf_url}#toolbar=0`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition flex items-center gap-1"
                                >
                                    <FileText className="w-3.5 h-3.5" /> {tc('viewPdf')}
                                </a>
                                <Link
                                    href={`/ai?course=${course.id}`}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                                >
                                    <Cpu className="w-4 h-4" /> {tc('askAi')}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
