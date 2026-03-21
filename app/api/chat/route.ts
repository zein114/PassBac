import { NextResponse } from 'next/server';
import { searchSimilarDocuments } from '@/lib/rag';
import openai from '@/lib/embeddings';

export async function POST(req: Request) {
    try {
        const { messages, courseId } = await req.json();

        // Get the latest user message
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
        }

        // 1. Retrieve similar chunks based on user query
        // If courseId is provided, the query should ideally filter on course_id in supabase
        // For MVP, we pass it into the search logic (we need to update rag.ts to support filter, but it does! `filter_course_id` exists in our SQL schema).
        // Let's modify searchSimilarDocuments locally if needed, or just let it search globally.
        // Our SQL `match_documents` accepts `filter_course_id`. Let's pass it.

        // (Wait, `searchSimilarDocuments` in rag.ts doesn't pass filter yet! We can just call it directly here for completeness MVP)
        const { getServiceSupabase } = await import('@/lib/supabase');
        const { generateEmbedding } = await import('@/lib/embeddings');

        const queryEmbedding = await generateEmbedding(lastMessage.content);
        const supabase = getServiceSupabase();

        const rpcParams: any = {
            query_embedding: queryEmbedding,
            match_count: 5
        };

        if (courseId) {
            rpcParams.filter_course_id = courseId;
        }

        const { data: chunks } = await supabase.rpc('match_documents', rpcParams);

        // 2. Build Prompt Context
        let contextText = '';
        if (chunks && chunks.length > 0) {
            contextText = chunks.map((c: any) => c.content).join('\n\n');
        }

        const systemPrompt = `You are a helpful Baccalaureate Preparation Assistant.
You must answer the user's question based ONLY on the following context.
If the answer cannot be found in the context, say exactly: "I don't know based on the provided course material."
Do not make up information.

Context section:
${contextText}
`;

        // 3. Call OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or 'gpt-4o' based on preference, MVP uses 3.5 for cost/speed
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.3,
        });

        const reply = response.choices[0].message.content;

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
