import OpenAI from 'openai';

// Lazy initialization — avoids crash at module load time when OPENAI_API_KEY is absent
// (e.g. when Groq is used as the chat provider)
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
    if (!_openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set. Embeddings require an OpenAI API key.');
        }
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const openai = getOpenAI();
    console.log(`[DEBUG-EMBED] Generating single embedding (${text.length} chars)...`);
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
}

/**
 * Batch embedding generation for performance.
 * OpenAI allows up to 2048 inputs per request.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const openai = getOpenAI();
    console.log(`[DEBUG-EMBED] Generating batch of ${texts.length} embeddings...`);
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts.map(t => t.replace(/\n/g, ' ')),
    });
    console.log(`[DEBUG-EMBED] Batch SUCCESS: Received ${response.data.length} embeddings.`);
    return response.data.map(d => d.embedding);
}
