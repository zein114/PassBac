'use client';

import { Link, usePathname } from '../i18n/navigation';
import { useAuth } from './AuthProvider';
import { LogOut, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

export function AdminNavbar({ locale }: { locale: string }) {
    const { user, profile, signOut } = useAuth();
    const pathname = usePathname();
    const t = useTranslations('Common');
    const ta = useTranslations('Admin');
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

    if (!user || !profile?.is_admin) return null;

    const links = [
        { href: '/admin', label: ta('overviewTitle') },
        { href: '/admin/courses', label: ta('manageContent') },
        { href: '/admin/users', label: ta('manageUsers') },
    ];

    return (
        <header
            className={`fixed top-4 left-0 right-0 z-50 px-4 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
                }`}
        >
            <nav className="w-full lg:max-w-fit mx-auto glass rounded-full px-3 py-2 sm:px-4 shadow-xl border border-white/40 flex items-center justify-between gap-4 lg:gap-6">
                {/* Logo */}
                <Link href="/admin" className="flex-shrink-0 transition-transform active:scale-90">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden border border-white/20 p-2 sm:p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt={ta('portalTitle')}
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-1">
                    {links.map(({ href, label }) => {
                        const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-white/60 hover:text-indigo-600'
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
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* User Avatar */}
                    <Link href="/profile" className="flex w-10 h-10 rounded-full bg-gray-100 border border-gray-200 items-center justify-center text-gray-500 text-xs font-bold shadow-inner overflow-hidden hover:ring-2 ring-indigo-500 transition-all">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user.email?.charAt(0).toUpperCase()
                        )}
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={signOut}
                        className="hidden lg:flex w-10 h-10 items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white/60 rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                <div className="lg:hidden mt-3 w-full max-w-xl mx-auto glass rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/40 origin-top animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-2">
                        {links.map(({ href, label }) => {
                            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-700 hover:bg-white/60'
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
