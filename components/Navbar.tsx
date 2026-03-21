'use client';

import { Link, usePathname } from '../i18n/navigation';
import { useAuth } from './AuthProvider';
import { BookOpenCheck, LayoutDashboard, BookOpen, MessageSquare, Brain, LogOut, ShieldCheck, Calendar, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Navbar({ locale }: { locale: string }) {
    const { user, profile, signOut } = useAuth();
    const pathname = usePathname();
    const t = useTranslations('Common');

    if (!user) return null;

    const links = [
        { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { href: '/courses', label: t('courses'), icon: BookOpen },
        { href: '/ai', label: t('aiTutor'), icon: MessageSquare },
        { href: '/quiz', label: t('quiz'), icon: Brain },
        { href: '/planner', label: t('planner'), icon: Calendar },
    ];

    if (profile?.is_admin) {
        links.push({ href: '/admin', label: t('admin'), icon: ShieldCheck });
    }

    const otherLocale = locale === 'fr' ? 'ar' : 'fr';
    const langLabel = locale === 'fr' ? 'العربية' : 'Français';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/80 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-indigo-200 transition-shadow">
                            <BookOpenCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-extrabold text-lg text-gray-900">{t('title')}</span>
                    </Link>

                    {/* Nav links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {links.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
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

                    {/* User info, Language and logout */}
                    <div className="flex items-center gap-2">
                        {/* Language Switcher */}
                        <Link
                            href={pathname}
                            locale={otherLocale}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                        >
                            <Languages className="w-4 h-4" />
                            <span>{langLabel}</span>
                        </Link>

                        <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/50">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-600 font-medium max-w-[100px] truncate">{user.email}</span>
                        </div>

                        <button
                            onClick={signOut}
                            className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                            title={t('logout')}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile nav */}
            <div className="lg:hidden border-t border-gray-100 bg-white/90 backdrop-blur-md flex overflow-x-auto no-scrollbar scroll-smooth">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center gap-1.5 px-6 py-3 min-w-[80px] text-[10px] font-bold uppercase tracking-wider flex-shrink-0 transition-all ${isActive
                                ? 'text-indigo-600 border-t-2 border-indigo-600 -mt-[1px] bg-indigo-50/50'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
