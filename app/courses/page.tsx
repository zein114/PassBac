'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Upload, Plus, Trash2, Cpu } from 'lucide-react';
import Link from 'next/link';

interface Course {
    id: string;
    title: string;
    subject: string;
    pdf_url: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newSubject, setNewSubject] = useState('Mathematics');

    const fetchCourses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (data && !error) {
            setCourses(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!newTitle.trim()) {
            alert('Please enter a course title before uploading.');
            return;
        }

        const file = e.target.files[0];
        setUploading(true);

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('courses')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const pdfUrl = supabase.storage.from('courses').getPublicUrl(filePath).data.publicUrl;

            // 2. Insert into courses table
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .insert({
                    title: newTitle,
                    subject: newSubject,
                    pdf_url: pdfUrl
                })
                .select()
                .single();

            if (courseError) throw courseError;

            // 3. Send to our API to process PDF and embeddings
            const formData = new FormData();
            formData.append('file', file);
            formData.append('courseId', courseData.id);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to process PDF text/embeddings');

            // Refresh listings
            fetchCourses();
            setNewTitle('');
        } catch (error: any) {
            alert('Upload error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        await supabase.from('courses').delete().eq('id', id);
        fetchCourses();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                    <p className="text-gray-500">Manage your course materials</p>
                </div>

                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Course Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Science">Science</option>
                    </select>

                    <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {uploading ? (
                            <span className="flex items-center"><Upload className="animate-bounce w-4 h-4 mr-2" /> Uploading...</span>
                        ) : (
                            <span className="flex items-center"><Plus className="w-4 h-4 mr-2" /> Add Course PDF</span>
                        )}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading courses...</div>
            ) : courses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                    No courses found. Add a PDF to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {course.subject}
                                    </div>
                                    <button onClick={() => handleDelete(course.id)} className="text-gray-400 hover:text-red-500 transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <FileText className="w-4 h-4 mr-2" /> PDF Document
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                                <a href={course.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                    View PDF
                                </a>
                                <Link href={`/ai?course=${course.id}`} className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800">
                                    <Cpu className="w-4 h-4 mr-1" /> Ask AI
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
