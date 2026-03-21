import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    const supabase = await createClient();

    // Check if we have a session before attempting to sign out
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session) {
        await supabase.auth.signOut();
    }

    return NextResponse.json({ success: true });
}
