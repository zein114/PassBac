import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';
import { searchSimilarDocuments } from '@/lib/rag';

function getChatClient(): { client: OpenAI; model: string } {
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
        return {
            client: new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' }),
            model: process.env.CHAT_MODEL || 'llama-3.1-8b-instant',
        };
    }
    return {
        client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
        model: process.env.CHAT_MODEL || 'gpt-3.5-turbo',
    };
}

export interface QuizQuestion {
    question: string;
    choices: string[];
    correctAnswer: number; // index 0-3
    explanation: string;
}

export async function POST(req: Request) {
    try {
        const supabaseClient = await createClient();
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('student_type')
            .eq('id', user.id)
            .single();

        const studentType = (profile?.student_type as 'C' | 'D') || null;

        const { courseId, topic } = await req.json();

        // Fetch relevant content via RAG
        const query = topic || 'general knowledge assessment';
        const chunks = await searchSimilarDocuments(query, {
            matchCount: 8,
            courseId: courseId || null,
            studentType,
        });

        const contextText = chunks.map((c) => c.content).join('\n\n');

        if (!contextText) {
            return NextResponse.json({ error: 'No course content found. Please upload course materials first.' }, { status: 400 });
        }

        const prompt = `You are an expert Baccalaureate teacher creating a quiz.

Based on the following course material, create exactly 4 multiple-choice questions (MCQs).

Rules:
- Each question must have exactly 4 choices (A, B, C, D)
- Only ONE answer is correct
- Include a brief explanation for the correct answer
- Questions should test understanding, not just memorization
- Difficulty should be appropriate for Baccalaureate level students

Course material:
${contextText}

Respond with ONLY a JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct."
  }
]`;

        const { client, model } = getChatClient();
        const response = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
        });

        const raw = response.choices[0].message.content || '[]';

        // Clean up potential markdown code fences from model output
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let questions: QuizQuestion[];
        try {
            questions = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({ error: 'Failed to parse quiz. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({ questions });

    } catch (error: any) {
        console.error('Quiz generation error:', error.message);
        return NextResponse.json({ error: 'Quiz generation failed. Please try again.' }, { status: 500 });
    }
}
