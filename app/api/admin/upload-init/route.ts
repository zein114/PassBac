import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

// Protect this route with an admin secret header OR a valid admin session
async function checkAdmin(req: Request): Promise<boolean> {
    const secret = req.headers.get('x-admin-secret');
    if (secret && secret === process.env.ADMIN_SECRET) return true;

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
        const { fileName } = await req.json();
        if (!fileName) {
            return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
        }

        const supabase = getServiceSupabase();
        // Keep alphanumeric, dots, dashes. Replace everything else with underscore to avoid "Invalid key" errors in Supabase Storage.
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${Date.now()}-${safeName}`;

        const { data, error } = await supabase.storage
            .from('courses')
            .createSignedUploadUrl(path);

        if (error) {
            throw new Error(`Failed to create signed upload URL: ${error.message}`);
        }

        return NextResponse.json({
            success: true,
            signedUrl: data.signedUrl,
            token: data.token,
            path: data.path,
        });
    } catch (error: any) {
        console.error('Upload init error:', error);
        return NextResponse.json({ error: error.message || 'Initialization failed' }, { status: 500 });
    }
}
