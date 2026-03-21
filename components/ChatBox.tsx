'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your Baccalaureate Preparation Assistant. Ask me anything about your courses — I am here to help you understand lessons, practice exercises, and prepare for your exams.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const courseId = searchParams.get('course');

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }], courseId }),
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || 'error');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I am sorry, I am not available at the moment. Please try again in a few seconds.',
            }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-100 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-800">AI Tutor</p>
                    <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Online
                    </p>
                </div>
            </div>

            {/* Course context notice — only if scoped to a course */}
            {courseId && (
                <div className="mx-4 mt-3 flex-shrink-0 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-indigo-700 font-medium">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Answers are focused on this course's content.
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-gray-50/50" ref={scrollRef}>
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2.5 max-w-[82%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                                {m.role === 'user' ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-200'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                }`}>
                                <p className="whitespace-pre-wrap">{m.content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-2.5">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                                {[0, 0.15, 0.3].map((delay, i) => (
                                    <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-50 bg-white flex flex-wrap gap-2">
                <button
                    onClick={() => { setInput('Can you explain this lesson simply?'); }}
                    className="px-3 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                    Explain Simply
                </button>
                <button
                    onClick={() => { setInput('Can you give me a practice exercise from this course?'); }}
                    className="px-3 py-1.5 rounded-lg border border-purple-100 bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors"
                >
                    Give me an Exercise
                </button>
                <button
                    onClick={() => { setInput('What are the key points I should remember?'); }}
                    className="px-3 py-1.5 rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700 text-xs font-semibold hover:bg-cyan-100 transition-colors"
                >
                    Key Points
                </button>
            </div>

            {/* Input bar */}
            <div className="px-4 pb-4 pt-3 bg-white flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about your courses..."
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
