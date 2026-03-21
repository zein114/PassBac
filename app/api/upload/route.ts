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

        // 2. Fetch course metadata to get student_type
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('student_type, title')
            .eq('id', courseId)
            .single();

        if (courseError || !course) {
            console.error('[Upload] Course not found:', courseId);
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const studentType = course.student_type as 'C' | 'D';
        console.log(`[Upload] Starting process for "${course.title}" (${studentType})`);

        // 3. Convert file to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Extract Text
        const extractedText = await extractTextFromPDFBuffer(buffer);
        console.log(`[Upload] Extracted ${extractedText.length} characters from PDF.`);

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('PDF content is empty or unreadable.');
        }

        // 5. Chunk Text
        const chunks = chunkText(extractedText, 800, 100);
        console.log(`[Upload] Created ${chunks.length} chunks.`);

        // 6. Process Embeddings and Store in Supabase
        await processAndStorePDF(courseId, studentType, chunks);

        return NextResponse.json({
            success: true,
            chunksProcessed: chunks.length,
            courseTitle: course.title
        });
    } catch (error: any) {
        console.error('API Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
