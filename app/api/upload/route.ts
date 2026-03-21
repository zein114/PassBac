import { NextResponse } from 'next/server';
import { extractTextFromPDFBuffer, chunkText } from '@/lib/pdf';
import { processAndStorePDF } from '@/lib/rag';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        // 1. Verify User Session Securely
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const courseId = formData.get('courseId') as string;

        if (!file || !courseId) {
            return NextResponse.json({ error: 'Missing file or courseId' }, { status: 400 });
        }

        // Convert file to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract Text
        const extractedText = await extractTextFromPDFBuffer(buffer);

        // Chunk Text
        const chunks = chunkText(extractedText, 800);

        // Process Embeddings and Store in Supabase
        await processAndStorePDF(courseId, chunks);

        return NextResponse.json({ success: true, chunksProcessed: chunks.length });
    } catch (error: any) {
        console.error('API Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
