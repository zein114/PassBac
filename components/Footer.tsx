'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' }
];

export function Footer() {
    const t = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    const [isLangOpen, setIsLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (newLocale: string) => {
        setIsLangOpen(false);
        if (!pathname) return;

        // Explode pathname, replace locale segment
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPathname = segments.join('/');

        router.replace(newPathname);
    };

    const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

    if (pathname && (pathname.includes('/login') || pathname.includes('/register'))) {
        return null;
    }

    return (
        <footer className="mt-auto border-t border-gray-100 bg-white py-12 relative">
            {/* Subtle background gradient to make it premium */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/20 pointer-events-none" />

            <div className="container-premium relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    {/* Brand Section */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center p-1.5 border border-indigo-500 shadow-md shadow-indigo-600/20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/logo.png"
                                    alt="PassBac"
                                    className="w-full h-full object-cover rounded-sm"
                                />
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight text-gray-900">PassBac</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium max-w-xs text-center md:text-left leading-relaxed">
                            {t('tagline') || 'Excellence in Education'}
                        </p>
                    </div>

                    {/* Right side controls */}
                    <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                        {/* Language Selector */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-600">
                                    <Globe className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 pr-2">
                                    {currentLang.label}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isLangOpen && (
                                <div className="absolute right-0 bottom-full mb-3 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden flex flex-col z-50 origin-bottom-right animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`flex items-center justify-between px-4 py-3 text-sm transition-colors text-left w-full ${
                                                locale === lang.code
                                                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                                                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                                            }`}
                                        >
                                            {lang.label}
                                            {locale === lang.code && <Check className="w-4 h-4 text-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400 font-medium tracking-wide">© {currentYear} PassBac. All rights reserved.</p>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-indigo-100 hover:shadow-md transition-all group cursor-default">
                        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                            {t('systemStatus') || 'System Operational'}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
