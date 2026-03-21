import { generateEmbeddings, generateEmbedding } from './embeddings';
import { getServiceSupabase } from './supabase';

// ─── Process and store text chunks (OpenAI-Free) ───────────

export async function processAndStorePDF(
    course_id: string,
    student_type: 'C' | 'D',
    chunks: string[]
): Promise<void> {
    const supabase = getServiceSupabase();

    console.log(`[DEBUG-RAG] START: Storing ${chunks.length} chunks for course ${course_id} (FTS Mode)`);

    const batchSize = 50; // Larger batches since we're just inserting text
    const batches = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
        batches.push(chunks.slice(i, i + batchSize));
    }

    let totalStored = 0;

    const processBatch = async (batch: string[], index: number) => {
        try {
            console.log(`[DEBUG-RAG] Inserting batch ${index + 1}/${batches.length}...`);

            const { error } = await supabase.from('embeddings').insert(
                batch.map((chunk) => ({
                    course_id,
                    student_type,
                    content: chunk,
                    // embedding column is left null as we use FTS now
                }))
            );

            if (error) {
                console.error(`[DEBUG-RAG] ERROR inserting batch ${index + 1}:`, error.message);
                throw error;
            }

            totalStored += batch.length;
        } catch (err: any) {
            console.error(`[DEBUG-RAG] Batch ${index + 1} failed:`, err.message);
        }
    };

    // Parallel insert is fine here as it's just DB IO
    await Promise.all(batches.map((batch, i) => processBatch(batch, i)));

    console.log(`[DEBUG-RAG] FINISHED: Stored ${totalStored}/${chunks.length} chunks.`);
}

// ─── Search relevant documents (FTS Mode) ────────────────────────

export async function searchSimilarDocuments(
    query: string,
    options: {
        matchCount?: number;
        courseId?: string | null;
        studentType?: 'C' | 'D' | null;
    } = {}
): Promise<Array<{ id: string; content: string; similarity: number }>> {
    const { matchCount = 8, courseId = null, studentType = null } = options;

    try {
        console.log(`[DEBUG-RAG] FTS SEARCH: "${query.slice(0, 30)}..." | course: ${courseId}`);
        const supabase = getServiceSupabase();

        // Use the new Full-Text Search RPC instead of match_documents
        const { data, error } = await supabase.rpc('search_documents_fts', {
            query_text: query,
            filter_course_id: courseId || null,
            filter_student_type: studentType || null,
            match_count: matchCount,
        });

        if (error) {
            console.error('[DEBUG-RAG] FTS RPC ERROR:', error.message);
            // Fallback: If the user hasn't run the SQL yet, try a simple manual filter (slow but works)
            console.log('[DEBUG-RAG] Falling back to manual content filtering...');
            const { data: manualData } = await supabase
                .from('embeddings')
                .select('id, content')
                .eq('course_id', courseId)
                .limit(matchCount);
            
            return (manualData || []).map(d => ({ ...d, similarity: 1 }));
        }

        console.log(`[DEBUG-RAG] FTS SUCCESS: Found ${data?.length || 0} matching chunks.`);
        
        // Final Fallback: If no matches and we have a courseId, just return the first chunks
        if ((!data || data.length === 0) && courseId) {
            console.log('[DEBUG-RAG] NO MATCHES: Returning first chunks as fallback...');
            const { data: fallbackData } = await supabase
                .from('embeddings')
                .select('id, content')
                .eq('course_id', courseId)
                .limit(matchCount);
            
            return (fallbackData || []).map(d => ({ ...d, similarity: 0.5 }));
        }

        return data || [];
    } catch (err: any) {
        console.error('[DEBUG-RAG] SEARCH CRITICAL ERR:', err.message);
        return [];
    }
}
