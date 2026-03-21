import { generateEmbedding } from './embeddings';
import { getServiceSupabase } from './supabase';

export async function processAndStorePDF(
    courseId: string,
    chunks: string[]
) {
    const supabase = getServiceSupabase();

    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);

        const { error } = await supabase.from('embeddings').insert({
            course_id: courseId,
            content: chunk,
            embedding: embedding
        });

        if (error) {
            console.error('Error inserting chunk:', error);
            throw new Error('Failed to store document chunk');
        }
    }
}

export async function searchSimilarDocuments(query: string, matchCount = 5) {
    const queryEmbedding = await generateEmbedding(query);
    const supabase = getServiceSupabase();

    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_count: matchCount
    });

    if (error) {
        console.error('Error in searchSimilarDocuments:', error);
        return [];
    }

    return data;
}
