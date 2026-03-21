import { generateEmbeddings, generateEmbedding } from './embeddings';
import { getServiceSupabase } from './supabase';

// ─── Process and store embeddings (Batch Optimized) ───────────

export async function processAndStorePDF(
    courseId: string,
    studentType: 'C' | 'D',
    chunks: string[]
): Promise<void> {
    const supabase = getServiceSupabase();

    console.log(`[RAG] Storing ${chunks.length} chunks for course ${courseId} (Type ${studentType})`);

    // Process in larger batches of 20 for OpenAI batch embedding
    const batchSize = 20;
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        try {
            const embeddings = await generateEmbeddings(batch);

            const { error } = await supabase.from('embeddings').insert(
                batch.map((chunk, index) => ({
                    course_id: courseId,
                    student_type: studentType,
                    content: chunk,
                    embedding: embeddings[index],
                }))
            );

            if (error) {
                console.error(`[RAG] Error storing batch ${i / batchSize}:`, error);
            } else {
                console.log(`[RAG] Batch ${i / batchSize + 1} processed (${batch.length} chunks).`);
            }
        } catch (err) {
            console.error(`[RAG] Failed to process batch ${i / batchSize}:`, err);
        }
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
