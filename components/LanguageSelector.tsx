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

export function LanguageSelector() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (newLocale: string) => {
        setIsOpen(false);
        if (!pathname) return;

        // Explode pathname, replace locale segment
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPathname = segments.join('/');

        router.replace(newPathname);
    };

    const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-600">
                    <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline font-semibold text-gray-700 sm:pr-2 text-sm pt-0.5">
                    {currentLang.label}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute end-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden flex flex-col z-[100] animate-in fade-in zoom-in-95 duration-200">
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
    );
}
