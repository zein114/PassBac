import { Suspense } from 'react';
import ChatBox from '@/components/ChatBox';

export default function AIPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">AI Tutor</h1>
                <p className="mt-1 text-gray-500 text-sm max-w-xl">
                    Ask your AI tutor anything about your uploaded courses. All answers come directly from your syllabus.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 overflow-hidden" style={{ height: '640px', display: 'flex', flexDirection: 'column' }}>
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading chat...</div>
                }>
                    <ChatBox />
                </Suspense>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">
                If you see a quota error, click <strong>Setup Model</strong> in the chat header to switch to a free provider like Groq.
            </p>
        </div>
    );
}
