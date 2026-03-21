'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Question {
    id: number;
    question: string;
    choices: string[];
    correctAnswer: number;
}

const SAMPLE_QUIZ: Question[] = [
    {
        id: 1,
        question: 'What is the derivative of e^x?',
        choices: ['e^x', 'x*e^(x-1)', '1/x', 'ln(x)'],
        correctAnswer: 0,
    },
    {
        id: 2,
        question: 'According to Newton\'s Second Law, F = ?',
        choices: ['m/a', 'm*v', 'm*a', 'm*c^2'],
        correctAnswer: 2,
    },
    {
        id: 3,
        question: 'Which of the following describes an exothermic reaction?',
        choices: ['Absorbs heat', 'Releases heat', 'Requires light', 'Generates cold'],
        correctAnswer: 1,
    }
];

export default function QuizPage() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);

    const handleSelect = (choiceIndex: number) => {
        setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: choiceIndex }));
    };

    const nextQuestion = () => {
        if (currentQuestion < SAMPLE_QUIZ.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setShowResults(false);
    };

    const calculateScore = () => {
        let score = 0;
        SAMPLE_QUIZ.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) score++;
        });
        return score;
    };

    if (showResults) {
        const score = calculateScore();
        const percentage = Math.round((score / SAMPLE_QUIZ.length) * 100);

        return (
            <div className="max-w-3xl mx-auto py-8">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
                    <div className="text-6xl mb-6 font-extrabold text-blue-600">
                        {percentage}%
                    </div>
                    <p className="text-xl text-gray-600 mb-8">
                        You scored {score} out of {SAMPLE_QUIZ.length}
                    </p>

                    <div className="space-y-4 mb-8 text-left">
                        {SAMPLE_QUIZ.map((q, idx) => {
                            const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                            return (
                                <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <p className="font-medium text-gray-900 flex items-center">
                                        {isCorrect ? <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> : <XCircle className="w-5 h-5 text-red-500 mr-2" />}
                                        {q.question}
                                    </p>
                                    <p className="text-sm mt-2 text-gray-700">
                                        Your answer: <span className="font-semibold">{q.choices[selectedAnswers[idx]] || 'None'}</span>
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-sm text-gray-700">
                                            Correct answer: <span className="font-semibold text-green-600">{q.choices[q.correctAnswer]}</span>
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={resetQuiz}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" /> Retake Quiz
                    </button>
                </div>
            </div>
        );
    }

    const q = SAMPLE_QUIZ[currentQuestion];
    const hasAnswered = selectedAnswers[currentQuestion] !== undefined;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Practice Quiz</h1>
                <div className="mt-4 flex items-center justify-between text-sm font-medium text-gray-500">
                    <span>Question {currentQuestion + 1} of {SAMPLE_QUIZ.length}</span>
                    <span>{Math.round((currentQuestion / SAMPLE_QUIZ.length) * 100)}% Completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion) / SAMPLE_QUIZ.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{q.question}</h2>

                    <div className="space-y-4">
                        {q.choices.map((choice, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAnswers[currentQuestion] === idx
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${selectedAnswers[currentQuestion] === idx ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                        }`}>
                                        {selectedAnswers[currentQuestion] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="text-lg text-gray-800">{choice}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={nextQuestion}
                        disabled={!hasAnswered}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {currentQuestion === SAMPLE_QUIZ.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>
            </div>
        </div>
    );
}
