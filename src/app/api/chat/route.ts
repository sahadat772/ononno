import { NextRequest, NextResponse } from 'next/server'
import { chat, getStudentSystemPrompt, Message } from '../../../lib/groq'
import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, classLevel, name, subjects } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    // Signature: getStudentSystemPrompt(classLevel, name, subjects?)
    const systemPrompt = getStudentSystemPrompt(
      classLevel || 'সাধারণ',
      name || 'শিক্ষার্থী',
      subjects
    )

    const response = await chat(messages as Message[], systemPrompt)

    const lastMessage = messages[messages.length - 1]
    try {
      await supabase.from('ai_conversations').insert([
        {
          user_id: user.id,
          role: 'user',
          content: lastMessage?.content ?? '',
          context: { classLevel, subjects },
        },
        {
          user_id: user.id,
          role: 'assistant',
          content: response,
          context: { classLevel, subjects },
        },
      ])
    } catch (saveErr) {
      console.error('ai_conversations save failed', saveErr)
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
