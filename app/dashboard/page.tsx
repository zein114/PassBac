'use client';

import { useAuth } from '@/components/AuthProvider';
import { BookOpen, GraduationCap, Target, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return null; // Will redirect via AuthProvider

    const subjects = [
        { title: 'Mathematics', courses: 4, icon: <GraduationCap className="h-8 w-8 text-blue-500" /> },
        { title: 'Physics', courses: 3, icon: <Target className="h-8 w-8 text-red-500" /> },
        { title: 'Science', courses: 5, icon: <BookOpen className="h-8 w-8 text-green-500" /> },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                <p className="mt-2 text-gray-600">Track your progress and continue learning.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject, idx) => (
                    <Link href={`/courses?subject=${subject.title.toLowerCase()}`} key={idx}>
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition cursor-pointer">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {subject.icon}
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                {subject.title}
                                            </dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">
                                                    {subject.courses} Courses available
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3">
                                <div className="text-sm">
                                    <span className="font-medium text-blue-700 hover:text-blue-900">
                                        View all {subject.title} courses
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Recent Activity (Mock)
                    </h3>
                </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        <li className="px-4 py-4 flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Completed Math Algebra Quiz</p>
                                <p className="text-sm text-gray-500">Score: 8/10</p>
                            </div>
                            <span className="text-xs text-gray-400">2 hours ago</span>
                        </li>
                        <li className="px-4 py-4 flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Read Physics Chapter 3</p>
                                <p className="text-sm text-gray-500">Kinetics and Dynamics</p>
                            </div>
                            <span className="text-xs text-gray-400">1 day ago</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
