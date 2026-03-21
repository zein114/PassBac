'use client';

import { Suspense } from 'react';
import ChatBox from '@/components/ChatBox';

export default function AIPage() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
                <p className="mt-2 text-gray-600">
                    Ask questions about your uploaded courses. The AI will answer based on the document content.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden h-[600px] flex flex-col">
                <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading chat...</div>}>
                    <ChatBox />
                </Suspense>
            </div>
        </div>
    );
}
