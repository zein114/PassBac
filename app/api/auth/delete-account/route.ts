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

        // 2. Initialize the admin client to bypass RLS and delete the user from auth.users
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 3. Delete the user
        // Note: Supabase automatically cascades deletion to 'profiles' table 
        // if there's an ON DELETE CASCADE constraint on profiles.id.
        // Even if not, deleting from auth.users prevents login.
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error('Delete user error:', deleteError);
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error('API /delete-account error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
