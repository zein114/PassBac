'use client';

import { Link } from '../i18n/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
    const t = useTranslations('Common');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-gray-100 bg-white py-12">
            <div className="container-premium">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center p-1.5 border border-white/20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/logo.png"
                                    alt="PassBac"
                                    className="w-full h-full object-cover rounded-sm"
                                />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-gray-900">PassBac</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">© {currentYear} — Excellence in Education</p>
                    </div>

                    {/* Simple Links */}
                    <div className="flex items-center gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <Link href="/dashboard" className="hover:text-indigo-600 transition-colors uppercase">
                            {t('dashboard')}
                        </Link>
                        <Link href="/courses" className="hover:text-indigo-600 transition-colors uppercase">
                            {t('courses')}
                        </Link>
                        <Link href="/ai" className="hover:text-indigo-600 transition-colors uppercase">
                            {t('aiTutor')}
                        </Link>
                    </div>

                    {/* Status / Region */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">System Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
