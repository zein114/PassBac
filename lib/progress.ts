import { getServiceSupabase } from '@/lib/supabase';

/**
 * Save or update quiz result for a user.
 * Uses upsert so each user has exactly one progress row.
 */
export async function saveQuizResult(
    userId: string,
    correct: number,
    total: number
): Promise<void> {
    const supabase = getServiceSupabase();

    // Fetch existing progress
    const { data: existing } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (existing) {
        await supabase
            .from('progress')
            .update({
                quizzes_taken: existing.quizzes_taken + 1,
                correct_answers: existing.correct_answers + correct,
                total_questions: existing.total_questions + total,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
    } else {
        await supabase.from('progress').insert({
            user_id: userId,
            quizzes_taken: 1,
            correct_answers: correct,
            total_questions: total,
        });
    }
}

/**
 * Fetch progress stats for a user.
 */
export async function getProgress(userId: string) {
    const supabase = getServiceSupabase();
    const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .single();

    return data ?? {
        quizzes_taken: 0,
        correct_answers: 0,
        total_questions: 0,
    };
}

/**
 * Count courses available for a student_type.
 */
export async function getCourseCount(studentType: string): Promise<number> {
    const supabase = getServiceSupabase();
    const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('student_type', studentType);
    return count ?? 0;
}
