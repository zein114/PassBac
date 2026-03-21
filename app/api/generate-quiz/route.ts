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

        // 1. Verify course exists
        const { data: course, error: courseCheckError } = await supabaseClient
            .from('courses')
            .select('id, title')
            .eq('id', courseId)
            .single();

        if (courseCheckError || !course) {
            return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
        }

        // 2. Fetch relevant content via RAG
        // For FTS, we use the course title as a default if no topic is provided
        const query = topic || course.title || 'general content';

        console.log(`[DEBUG-QUIZ] Searching for: "${query}" (Course: ${course.title})`);
        const chunks = await searchSimilarDocuments(query, {
            matchCount: 12, // Increased for FTS to get more potential context
            courseId: courseId || null,
            studentType,
        });

        let contextText = chunks.map((c) => c.content).join('\n\n');

        // Prevent 413 "Request too large" with Groq free tier limit of 6000 TPM
        // 12000 chars is roughly 3000 tokens, which is very safe.
        const maxChars = 12000;
        if (contextText.length > maxChars) {
            console.log(`[DEBUG-QUIZ] Truncating context from ${contextText.length} to ${maxChars} chars.`);
            contextText = contextText.slice(0, maxChars);
        }

        if (!contextText) {
            console.warn(`[DEBUG-QUIZ] No context found for course ${courseId}.`);
            return NextResponse.json({
                error: `No searchable content found for "${course.title}". Please try re-uploading the PDF or ensure it contains readable text.`
            }, { status: 400 });
        }

        console.log(`[DEBUG-QUIZ] Context length: ${contextText.length} chars. Generating prompt...`);

        const prompt = `You are an expert Baccalaureate teacher creating a quiz.
        
Based on the following course material, create exactly 4 multiple-choice questions (MCQs).

Course material:
${contextText}

Rules:
1. Each question must have exactly 4 choices (A, B, C, D)
2. Only ONE answer is correct
3. Include a brief explanation for the correct answer
4. Questions should test understanding, not just memorization
5. Respond with ONLY a JSON array in the required format.

If the course material provided above is empty or irrelevant, do not invent knowledge. Instead, return:
[{"question": "No content available for this course yet.", "choices": ["Please", "Upload", "Valid", "PDF"], "correctAnswer": 0, "explanation": "The PDF might not have readable text."}]

Respond with ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct."
  }
]`;

        const { client, model } = getChatClient();
        console.log(`[DEBUG-QUIZ] Calling AI model: ${model}...`);

        const response = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
        });

        const raw = response.choices[0].message.content || '[]';
        console.log(`[DEBUG-QUIZ] AI Response received (${raw.length} chars).`);

        // Clean up potential markdown code fences from model output
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let questions: QuizQuestion[];
        try {
            questions = JSON.parse(cleaned);
        } catch (err: any) {
            console.error('[DEBUG-QUIZ] JSON Parse Error:', err.message);
            return NextResponse.json({ error: 'Failed to parse quiz response.' }, { status: 500 });
        }

        console.log(`[DEBUG-QUIZ] SUCCESS: Generated ${questions.length} questions.`);
        return NextResponse.json({ questions });

    } catch (error: any) {
        console.error('[DEBUG-QUIZ] CRITICAL ERROR:', error.message);
        return NextResponse.json({ error: 'Quiz generation failed. Please try again.' }, { status: 500 });
    }
}
