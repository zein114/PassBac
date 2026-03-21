'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, BookOpen, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminDashboard() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [recentCourses, setRecentCourses] = useState<any[]>([]);

    // Form states
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('Mathematics');
    const [studentType, setStudentType] = useState<'C' | 'D'>('C');
    const [file, setFile] = useState<File | null>(null);

    const supabase = createClient();

    useEffect(() => {
        if (!authLoading && !profile?.is_admin) {
            router.push('/dashboard');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        if (profile?.is_admin) {
            loadRecentCourses();
        }
    }, [profile]);

    const loadRecentCourses = async () => {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        setRecentCourses(data || []);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) { setError('Please select a PDF file.'); return; }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('student_type', studentType);
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setSuccess('Course uploaded and processed successfully!');
            setTitle('');
            setFile(null);
            loadRecentCourses();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteCourse = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course and all its embeddings?')) return;

        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) {
            alert('Failed to delete: ' + error.message);
        } else {
            loadRecentCourses();
        }
    };

    if (authLoading || !profile?.is_admin) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage courses and content for Bac C & D students.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-indigo-500" /> Upload New Course
                        </h2>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Complex Numbers"
                                    className="input-modern"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="input-modern"
                                >
                                    <option>Mathematics</option>
                                    <option>Physics</option>
                                    <option>Science</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['C', 'D'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setStudentType(type)}
                                            className={`py-2 rounded-xl border-2 text-sm font-bold transition-all ${studentType === type
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-gray-100 text-gray-500 hover:border-indigo-200'
                                                }`}
                                        >
                                            Bac {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">PDF File</label>
                                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all ${file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                                    <div className="space-y-1 text-center">
                                        {file ? (
                                            <div className="flex flex-col items-center">
                                                <FileText className="mx-auto h-12 w-12 text-green-500" />
                                                <p className="text-sm text-green-700 font-medium mt-2">{file.name}</p>
                                                <button type="button" onClick={() => setFile(null)} className="text-xs text-red-500 mt-1 hover:underline">Remove</button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto h-12 w-12 text-gray-300" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                        <span>Upload a file</span>
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            className="sr-only"
                                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 text-red-700 bg-red-50 rounded-xl text-sm border border-red-100">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 p-3 text-green-700 bg-green-50 rounded-xl text-sm border border-green-100">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !file}
                                className="btn-primary flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {loading ? 'Processing RAG...' : 'Upload Course'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Courses */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-500" /> Recently Uploaded
                            </h2>
                            <span className="text-xs font-medium text-gray-500">{recentCourses.length} items</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {recentCourses.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 text-sm">No courses uploaded yet.</div>
                            ) : (
                                recentCourses.map((c) => (
                                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{c.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {c.subject} • Bac {c.student_type} • {new Date(c.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={c.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                title="View PDF"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => deleteCourse(c.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete Course"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
