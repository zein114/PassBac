import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { saveQuizResult } from '@/lib/progress';

export async function POST(req: Request) {
    try {
        const supabaseClient = await createClient();
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { correct, total } = await req.json();
        await saveQuizResult(user.id, correct, total);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Save progress error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
