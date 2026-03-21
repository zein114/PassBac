import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
})

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch profile to know the student type
    const { data: profile } = await supabase
        .from('profiles')
        .select('student_type')
        .eq('id', user.id)
        .single()

    const { locale } = await request.json()
    const language = locale === 'ar' ? 'Arabic' : 'French'

    const systemPrompt = `You are a professional academic counselor for the Baccalaureate.
Generate a balanced weekly study plan for a student in "Série ${profile?.student_type || 'C'}".
The plan must be for 7 days.
For each day, provide 2 sessions.
Subjects allowed: Mathematics, Physics, Science.

Return ONLY a JSON array of objects:
[
  {
    "title": "Topic description",
    "subject": "Mathematics",
    "date": "YYYY-MM-DD",
    "start_time": "HH:MM",
    "end_time": "HH:MM"
  }
]

Respond in ${language}. Date should start from today.`

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            model: process.env.CHAT_MODEL || 'llama3-8b-8192',
            response_format: { type: 'json_object' }
        })

        const content = completion.choices[0].message.content
        const sessions = JSON.parse(content || '{}').sessions || JSON.parse(content || '[]')

        // Insert into database
        const { data, error } = await supabase
            .from('study_sessions')
            .insert(sessions.map((s: any) => ({ ...s, user_id: user.id })))
            .select()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
