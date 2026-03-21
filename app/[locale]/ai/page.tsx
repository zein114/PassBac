import { Suspense } from 'react';
import ChatBox from '@/components/ChatBox';

import { useTranslations } from 'next-intl';

export default function AIPage() {
    const t = useTranslations('AI');
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">{t('title')}</h1>
                <p className="mt-1 text-gray-500 text-sm max-w-xl">
                    {t('description')}
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 overflow-hidden" style={{ height: '640px', display: 'flex', flexDirection: 'column' }}>
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">{t('loadingChat')}</div>
                }>
                    <ChatBox />
                </Suspense>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">
                {t('quotaWarning')}
            </p>
        </div>
    );
}

