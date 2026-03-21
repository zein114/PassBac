'use client';

import { Link, usePathname } from '../i18n/navigation';
import { useAuth } from './AuthProvider';
import { LogOut, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

export function Navbar({ locale }: { locale: string }) {
    const { user, profile, signOut } = useAuth();
    const pathname = usePathname();
    const t = useTranslations('Common');
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 80) {
                    setIsVisible(false); // Hide on scroll down
                } else {
                    setIsVisible(true); // Show on scroll up
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    if (!user) return null;

    const links = [
        { href: '/dashboard', label: t('dashboard') },
        { href: '/courses', label: t('courses') },
        { href: '/ai', label: t('aiTutor') },
        { href: '/quiz', label: t('quiz') },
        { href: '/planner', label: t('planner') },
    ];

    if (profile?.is_admin) {
        links.push({ href: '/admin', label: t('admin') });
    }

    return (
        <header
            className={`fixed top-4 left-0 right-0 z-50 px-4 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
                }`}
        >
            <nav className="max-w-fit mx-auto glass rounded-full px-4 py-2 shadow-xl border border-white/40 flex items-center gap-6">
                {/* Logo Icon Only (Enlarged & Edge-to-Edge) */}
                <Link href="/dashboard" className="flex-shrink-0 transition-transform active:scale-90">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden border border-white/20 p-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt={t('title')}
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-1">
                    {links.map(({ href, label }) => {
                        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive
                                    ? 'text-indigo-600 bg-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-px h-6 bg-gray-200" />

                {/* Right side tools */}
                <div className="flex items-center gap-2">
                    {/* Minimalist User Avatar */}
                    <div className="hidden sm:flex w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold shadow-inner">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={signOut}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                <div className="lg:hidden mt-3 max-w-sm mx-auto glass rounded-3xl p-4 shadow-2xl border border-white/40 animate-fade-in">
                    <div className="flex flex-col gap-2">
                        {links.map(({ href, label }) => {
                            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-600 hover:bg-white/60'
                                        }`}
                                >
                                    <span>{label}</span>
                                    {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                signOut();
                            }}
                            className="px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all mt-2 border border-red-100/50"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
