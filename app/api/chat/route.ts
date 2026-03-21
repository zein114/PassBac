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

export async function POST(req: Request) {
  try {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Load student profile to get student_type for RAG filtering
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('student_type')
      .eq('id', user.id)
      .single();

    const studentType = (profile?.student_type as 'C' | 'D') || null;

    const { messages, courseId, locale } = await req.json();
    const language = locale === 'ar' ? 'Arabic' : 'French';

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // RAG: search filtered by studentType (and optionally courseId)
    const chunks = await searchSimilarDocuments(lastMessage.content, {
      matchCount: 6,
      courseId: courseId || null,
      studentType,
    });

    console.log(`[Chat] RAG retrieved ${chunks.length} chunks for "${lastMessage.content.slice(0, 30)}..."`);

    let contextText = chunks.map((c) => c.content).join('\n\n');

    // Prevent 413 "Request too large" with Groq free tier limit of 6000 TPM
    const maxChars = 12000;
    if (contextText.length > maxChars) {
      console.log(`[Chat] Truncating context from ${contextText.length} to ${maxChars} chars.`);
      contextText = contextText.slice(0, maxChars);
    }

    const systemPrompt = `You are BacTutor, an expert teacher for Baccalaureate Series ${studentType || 'General'} students.
IMPORTANT: Respond ONLY in ${language}.

Your role is to TEACH, not just answer. Follow these rules:
1. Explain concepts step-by-step, like a patient teacher
2. Use simple language appropriate for a high-school student
3. After explaining, offer a short practice exercise or ask a follow-up question to test understanding
4. If the student seems confused, simplify further with an analogy
5. If a student asks to generate an exercise, create one with a clear solution
6. Always be encouraging and supportive

${contextText ? `Use this course material as your primary knowledge source:\n\n${contextText}` : 'No specific course material is loaded. Give a general educational answer based on the Baccalaureate curriculum.'}

Only answer topics relevant to the Baccalaureate curriculum. If a question is off-topic, gently redirect.`;

    const { client, model } = getChatClient();

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.5,
    });

    const reply = response.choices[0].message.content;
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Chat API Error:', error.message);
    return NextResponse.json({ error: 'assistant_unavailable' }, { status: 500 });
  }
}
