'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { BookOpenCheck, LayoutDashboard, BookOpen, MessageSquare, Brain, LogOut, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const { user, profile, signOut } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/courses', label: 'Courses', icon: BookOpen },
        { href: '/ai', label: 'Ask AI', icon: MessageSquare },
        { href: '/quiz', label: 'Quiz', icon: Brain },
    ];

    if (profile?.is_admin) {
        links.push({ href: '/admin', label: 'Admin', icon: ShieldCheck });
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/80 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-indigo-200 transition-shadow">
                            <BookOpenCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-extrabold text-lg text-gray-900">BacPrep</span>
                    </Link>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User info and logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-600 font-medium max-w-[120px] truncate">{user.email}</span>
                        </div>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden border-t border-gray-100 bg-white flex overflow-x-auto">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium flex-shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
