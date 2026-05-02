import { NextRequest, NextResponse } from 'next/server'
import { chat, getCareerGuidancePrompt, Message } from '../../../lib/groq'
import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { name, classLevel, interests, strengths, messages } = await request.json()

        if (!classLevel || !interests || !strengths) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Career guidance system prompt
        const systemPrompt = getCareerGuidancePrompt(
            name || 'শিক্ষার্থী',
            classLevel,
            interests,
            strengths
        )

        // Initial message যদি না থাকে
        const chatMessages: Message[] = messages || [
            {
                role: 'user',
                content: `আমার নাম ${name}। আমি ${classLevel} এ পড়ি। আমার ক্যারিয়ার পাথ সম্পর্কে গাইড করো।`,
            },
        ]

        const response = await chat(chatMessages, systemPrompt)

        // Career suggestion save করো
        await supabase
            .from('student_profiles')
            .update({
                career_suggestion: {
                    interests,
                    strengths,
                    ai_suggestion: response,
                    generated_at: new Date().toISOString(),
                },
            })
            .eq('user_id', user.id)

        // Conversation save
        await supabase.from('ai_conversations').insert([
            {
                user_id: user.id,
                role: 'assistant',
                content: response,
                context: { type: 'career_guidance', classLevel, interests, strengths },
            },
        ])

        return NextResponse.json({ response })

    } catch (error) {
        console.error('Career API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}