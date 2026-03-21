import { generateEmbedding } from './embeddings';
import { getServiceSupabase } from './supabase';

// ─── PDF Text Extraction & Chunking ─────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(buffer);
    return parsed.text;
}

function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let start = 0;
    while (start < words.length) {
        const chunk = words.slice(start, start + chunkSize).join(' ');
        if (chunk.trim()) chunks.push(chunk.trim());
        start += chunkSize - overlap;
    }
    return chunks;
}

// ─── Process PDF and store embeddings ───────────────────────

export async function processAndStorePDF(
    file: File,
    courseId: string,
    studentType: 'C' | 'D'
): Promise<void> {
    const supabase = getServiceSupabase();

    const text = await extractTextFromFile(file);
    const chunks = chunkText(text);

    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        await Promise.all(
            batch.map(async (chunk) => {
                const embedding = await generateEmbedding(chunk);
                const { error } = await supabase.from('embeddings').insert({
                    course_id: courseId,
                    student_type: studentType,
                    content: chunk,
                    embedding,
                });
                if (error) console.error('Error storing chunk:', error);
            })
        );
    }
}

// ─── Search relevant documents (RAG) ────────────────────────

export async function searchSimilarDocuments(
    query: string,
    options: {
        matchCount?: number;
        courseId?: string | null;
        studentType?: 'C' | 'D' | null;
    } = {}
): Promise<Array<{ id: string; content: string; similarity: number }>> {
    const { matchCount = 5, courseId = null, studentType = null } = options;

    try {
        const queryEmbedding = await generateEmbedding(query);
        const supabase = getServiceSupabase();

        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_count: matchCount,
            filter_course_id: courseId || null,
            filter_student_type: studentType || null,
        });

        if (error) {
            console.error('RAG search error:', error);
            return [];
        }

        return data || [];
    } catch {
        return [];
    }
}
