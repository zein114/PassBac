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
        { role: 'assistant', content: 'Hello! I am your Baccalaureate Preparation Assistant. What would you like to learn today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const courseId = searchParams.get('course'); // Optional context

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }],
                    courseId,
                }),
            });

            if (!res.ok) throw new Error('API Error');

            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {courseId && (
                <div className="bg-blue-50 px-4 py-2 text-sm text-blue-800 border-b border-blue-100 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Chatting with focus on specific course material.
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-blue-600 ml-3' : 'bg-purple-600 mr-3'}`}>
                                {m.role === 'user' ? <UserIcon className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[80%] flex-row">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 mr-3 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your courses..."
                        className="flex-1 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
