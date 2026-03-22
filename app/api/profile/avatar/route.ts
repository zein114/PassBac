import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient();
        
        // 1. Get the current user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 2. Initialize the admin client to bypass Storage RLS
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { persistSession: false, autoRefreshToken: false }
            }
        );

        // Ensure bucket exists (just in case)
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        if (!buckets?.some(b => b.name === 'avatars')) {
            await supabaseAdmin.storage.createBucket('avatars', { public: true });
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}-${Math.random()}.${fileExt}`;

        // 3. Upload file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabaseAdmin.storage
            .from('avatars')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 });
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage.from('avatars').getPublicUrl(filePath);

        // 5. Update user profile directly here
        const { error: updateError } = await supabaseAdmin.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
        
        if (updateError) {
             console.error('Profile update error:', updateError);
             return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true, publicUrl });
        
    } catch (error) {
        console.error('API /avatar/upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
