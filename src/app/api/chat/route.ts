import { NextRequest, NextResponse } from 'next/server'
import { chat, getStudentSystemPrompt, Message } from '../../../lib/groq'
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

        // Request body
        const { messages, classLevel, name, subjects } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid messages' },
                { status: 400 }
            )
        }

        // System prompt তৈরি
        const systemPrompt = getStudentSystemPrompt(
            name || 'শিক্ষার্থী',
            classLevel || 'সাধারণ',
            subjects
        )

        // AI response
        const response = await chat(messages as Message[], systemPrompt)

        // Conversation save করো (ML data collection)
        const lastMessage = messages[messages.length - 1]
        await supabase.from('ai_conversations').insert([
            {
                user_id: user.id,
                role: 'user',
                content: lastMessage.content,
                context: { classLevel, subjects },
            },
            {
                user_id: user.id,
                role: 'assistant',
                content: response,
                context: { classLevel, subjects },
            },
        ])

        return NextResponse.json({ response })

    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}