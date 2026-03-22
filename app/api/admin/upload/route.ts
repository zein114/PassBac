import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

import { createClient } from '@/utils/supabase/server';

// Protect this route with an admin secret header OR a valid admin session
async function checkAdmin(req: Request): Promise<boolean> {
    // 1. Check secret header
    const secret = req.headers.get('x-admin-secret');
    if (secret && secret === process.env.ADMIN_SECRET) return true;

    // 2. Check user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    return !!profile?.is_admin;
}

export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
    if (!(await checkAdmin(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, subject, student_type, path } = await req.json();

        if (!title || !subject || !student_type || !path) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (student_type !== 'C' && student_type !== 'D') {
            return NextResponse.json({ error: 'student_type must be C or D' }, { status: 400 });
        }

        console.log(`[Admin Upload] Title: ${title}, Type: ${student_type}, Path: ${path}`);
        const supabase = getServiceSupabase();

        // The file is already uploaded to Supabase Storage by the client
        // We just get the public URL for the DB
        const pdfUrl = supabase.storage.from('courses').getPublicUrl(path).data.publicUrl;

        console.log('[Admin Upload] Upload successful, inserting to DB...');
        // 2. Insert course into DB
        console.log(`[DEBUG-UPLOAD] Inserting course "${title}" into DB...`);
        const { data: course, error: courseErr } = await supabase
            .from('courses')
            .insert({ title, subject, student_type, pdf_url: pdfUrl })
            .select()
            .single();

        if (courseErr) {
            console.error('[DEBUG-UPLOAD] DB ERROR (course insert):', courseErr.message);
            throw new Error(`Course insert failed: ${courseErr.message}`);
        }
        console.log('[DEBUG-UPLOAD] DB SUCCESS: Course record created:', course.id);

        // 3. Run RAG pipeline
        console.log('[DEBUG-UPLOAD] Starting RAG pipeline (text extraction)...');
        const { extractTextFromPDFBuffer, chunkText } = await import('@/lib/pdf');
        const { processAndStorePDF } = await import('@/lib/rag');

        try {
            // First we need to download the file into memory to parse it
            const { data: fileBlob, error: downloadErr } = await supabase.storage.from('courses').download(path);
            if (downloadErr || !fileBlob) {
                console.warn('[DEBUG-UPLOAD] Failed to download PDF for RAG. It will be skipped.', downloadErr);
                throw new Error('Could not download pdf for text extraction');
            }

            const arrayBuffer = await fileBlob.arrayBuffer();
            const fileBuffer = Buffer.from(arrayBuffer);
            const extractedText = await extractTextFromPDFBuffer(fileBuffer);

            if (extractedText && extractedText.trim().length > 0) {
                const chunks = chunkText(extractedText, 800, 100);
                if (chunks.length > 0) {
                    console.log(`[DEBUG-UPLOAD] RAG: Processing ${chunks.length} chunks...`);
                    await processAndStorePDF(course.id, student_type as 'C' | 'D', chunks);
                    console.log('[DEBUG-UPLOAD] RAG SUCCESS: All embeddings processed.');
                } else {
                    console.warn('[DEBUG-UPLOAD] RAG WARNING: No valid chunks generated from text!');
                }
            } else {
                console.warn('[DEBUG-UPLOAD] RAG WARNING: PDF text is empty, skipping embeddings.');
            }
        } catch (ragErr: any) {
            console.error('[DEBUG-UPLOAD] RAG CRITICAL ERROR:', ragErr.message);
            // We still return success for the course upload, but notify about RAG failure in logs
        }

        return NextResponse.json({
            success: true,
            course: {
                id: course.id,
                title: course.title,
                base_url: pdfUrl, // returning for reference
            },
        });

    } catch (error: any) {
        console.error('Admin upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
