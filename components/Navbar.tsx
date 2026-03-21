'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { BookOpen, LogOut, LayoutDashboard, MessageSquare, GraduationCap } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <GraduationCap className="h-8 w-8 text-blue-600" />
                            <span className="font-bold text-xl text-gray-900 hidden sm:block">
                                Bac Prep
                            </span>
                        </Link>

                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/dashboard"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/dashboard' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link
                                href="/courses"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname.startsWith('/courses') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Courses
                            </Link>
                            <Link
                                href="/ai"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname.startsWith('/ai') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Ask AI
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4 hidden sm:block">
                            {user.email}
                        </span>
                        <button
                            onClick={signOut}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
