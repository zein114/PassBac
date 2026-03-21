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

IMPORTANT RULES:
1. Use ONLY these exact subject names: "Mathematics", "Physics", "Science". NOTHING ELSE.
2. The response must be a valid JSON object with a "sessions" key containing an array of sessions.

Example format:
{
  "sessions": [
    {
      "title": "Complex Numbers Practice",
      "subject": "Mathematics",
      "date": "2026-03-21",
      "start_time": "09:00",
      "end_time": "11:00"
    }
  ]
}

Respond in ${language}. Date should start from today.`

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            model: process.env.CHAT_MODEL || 'llama3-8b-8192',
            response_format: { type: 'json_object' }
        })

        const content = completion.choices[0].message.content
        console.log('AI Planner Response:', content)

        const parsed = JSON.parse(content || '{}')
        const sessions = parsed.sessions || (Array.isArray(parsed) ? parsed : [])

        if (sessions.length === 0) {
            throw new Error('AI returned an empty or invalid schedule.')
        }

        // Insert into database
        const { data, error } = await supabase
            .from('study_sessions')
            .insert(sessions.map((s: any) => ({
                user_id: user.id,
                title: s.title || 'Study Session',
                subject: s.subject || 'Mathematics',
                date: s.date,
                start_time: s.start_time,
                end_time: s.end_time,
                status: 'pending'
            })))
            .select()

        if (error) {
            console.error('DB Insert Error:', error)
            throw error
        }
        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Planner Generate Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
