'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Brain, Loader2, CheckCircle, XCircle, RefreshCw, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface QuizQuestion {
    question: string;
    choices: string[];
    correctAnswer: number;
    explanation: string;
}

interface Course { id: string; title: string; subject: string; }

type QuizMode = 'select' | 'loading' | 'active' | 'results';

export default function QuizPage() {
    const { user, profile } = useAuth();
    const [mode, setMode] = useState<QuizMode>('select');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [answers, setAnswers] = useState<number[]>([]);
    const [current, setCurrent] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        if (profile?.student_type) {
            supabase
                .from('courses')
                .select('id, title, subject')
                .eq('student_type', profile.student_type)
                .then(({ data }) => setCourses(data || []));
        }
    }, [profile]);

    const generateQuiz = async () => {
        if (!selectedCourse) { setError('Please select a course first.'); return; }
        setError(null);
        setMode('loading');
        try {
            const res = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: selectedCourse }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Generation failed');
            setQuestions(data.questions);
            setAnswers([]);
            setCurrent(0);
            setMode('active');
        } catch (e: any) {
            setError(e.message);
            setMode('select');
        }
    };

    const handleAnswer = (choiceIdx: number) => {
        const newAnswers = [...answers, choiceIdx];
        setAnswers(newAnswers);
        if (current + 1 < questions.length) {
            setCurrent(current + 1);
        } else {
            finishQuiz(newAnswers);
        }
    };

    const finishQuiz = async (finalAnswers: number[]) => {
        setMode('results');
        if (!user) return;
        // Save progress
        setSaving(true);
        const correct = finalAnswers.filter((a, i) => a === questions[i].correctAnswer).length;
        try {
            await fetch('/api/save-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correct, total: questions.length }),
            });
        } catch { }
        setSaving(false);
    };

    const correctCount = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
    const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

    if (mode === 'select') return (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Practice Quiz</h1>
                <p className="mt-1 text-gray-500 text-sm">AI generates a quiz from your course material.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> AI-Generated Quiz</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select a course</label>
                    {courses.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No courses available yet. Your teacher hasn't uploaded any materials.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {courses.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCourse(c.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${selectedCourse === c.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-300 text-gray-700'}`}
                                >
                                    <span>{c.title}</span>
                                    <span className="text-xs opacity-60">{c.subject}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
                <button
                    onClick={generateQuiz}
                    disabled={!selectedCourse || courses.length === 0}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" /> Generate Quiz with AI
                </button>
            </div>
        </div>
    );

    if (mode === 'loading') return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
                <Brain className="w-7 h-7 text-white" />
            </div>
            <p className="text-gray-600 font-medium">Generating your quiz…</p>
            <p className="text-gray-400 text-sm">The AI is reading your course material</p>
        </div>
    );

    if (mode === 'active') {
        const q = questions[current];
        return (
            <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Question {current + 1} of {questions.length}</span>
                    <div className="h-2 bg-gray-100 rounded-full w-48 overflow-hidden">
                        <div className="h-2 bg-indigo-500 rounded-full transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                    <p className="text-lg font-bold text-gray-900">{q.question}</p>
                    <div className="space-y-3">
                        {q.choices.map((choice, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-sm font-medium text-gray-700 transition-all flex items-center gap-3"
                            >
                                <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {choice}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Results view
    return (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
            <div className={`rounded-2xl p-6 text-center text-white ${pct >= 75 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : pct >= 50 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-rose-500 to-red-600'}`}>
                <p className="text-5xl font-extrabold mb-1">{pct}%</p>
                <p className="text-white/80">{correctCount} / {questions.length} correct</p>
                <p className="mt-2 font-semibold">{pct >= 75 ? '🎉 Excellent work!' : pct >= 50 ? '👍 Good effort!' : '📚 Keep studying!'}</p>
                {saving && <p className="text-white/60 text-xs mt-1">Saving progress…</p>}
            </div>

            <div className="space-y-4">
                {questions.map((q, i) => {
                    const isCorrect = answers[i] === q.correctAnswer;
                    return (
                        <div key={i} className={`bg-white rounded-2xl border-2 p-4 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                            <div className="flex items-start gap-3">
                                {isCorrect ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">{q.question}</p>
                                    {!isCorrect && (
                                        <p className="text-sm text-red-600 mt-1">Your answer: {q.choices[answers[i]]}</p>
                                    )}
                                    <p className={`text-sm mt-1 font-medium ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                                        Correct: {q.choices[q.correctAnswer]}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{q.explanation}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button onClick={() => { setMode('select'); setAnswers([]); setCurrent(0); }} className="btn-primary flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Try Another Quiz
            </button>
        </div>
    );
}
