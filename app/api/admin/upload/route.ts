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

export async function POST(req: Request) {
    if (!(await checkAdmin(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const title = formData.get('title') as string;
        const subject = formData.get('subject') as string;
        const student_type = formData.get('student_type') as string;
        const file = formData.get('file') as File;

        if (!title || !subject || !student_type || !file) {
            return NextResponse.json({ error: 'Missing required fields: title, subject, student_type, file' }, { status: 400 });
        }
        if (student_type !== 'C' && student_type !== 'D') {
            return NextResponse.json({ error: 'student_type must be C or D' }, { status: 400 });
        }

        const supabase = getServiceSupabase();

        // 1. Upload PDF to Supabase Storage
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const fileBuffer = await file.arrayBuffer();
        const { error: uploadErr } = await supabase.storage
            .from('courses')
            .upload(fileName, fileBuffer, { contentType: 'application/pdf' });

        if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

        const pdfUrl = supabase.storage.from('courses').getPublicUrl(fileName).data.publicUrl;

        // 2. Insert course into DB
        const { data: course, error: courseErr } = await supabase
            .from('courses')
            .insert({ title, subject, student_type, pdf_url: pdfUrl })
            .select()
            .single();

        if (courseErr) throw new Error(`Course insert failed: ${courseErr.message}`);

        // 3. Run RAG pipeline
        const { processAndStorePDF } = await import('@/lib/rag');
        await processAndStorePDF(file, course.id, student_type as 'C' | 'D');

        return NextResponse.json({
            success: true,
            course: {
                id: course.id,
                title: course.title,
                subject: course.subject,
                student_type: course.student_type,
                pdf_url: pdfUrl,
            },
        });

    } catch (error: any) {
        console.error('Admin upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
