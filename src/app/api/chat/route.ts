import { NextRequest, NextResponse } from 'next/server'
import { chat, getStudentSystemPrompt, Message } from '@/lib/groq'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI_NOT_CONFIGURED',
          response:
            'AI এখনো সেটআপ হয়নি। Admin-কে বলো Vercel-এ **GROQ_API_KEY** যোগ করতে।',
        },
        { status: 500 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', response: 'সেশন শেষ। আবার লগইন করো।' },
        { status: 401 }
      )
    }

    let body: {
      messages?: { role?: string; content?: string }[]
      classLevel?: string
      name?: string
      subjects?: string[]
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'INVALID_BODY', response: 'অবৈধ অনুরোধ।' },
        { status: 400 }
      )
    }

    const rawMessages = body.messages
    if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages', response: 'কোনো মেসেজ নেই।' },
        { status: 400 }
      )
    }

    // Only user/assistant with non-empty content; keep last 12 turns
    const messages: Message[] = rawMessages
      .filter(
        (m) =>
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
      )
      .slice(-12)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content).slice(0, 4000),
      }))

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Empty messages', response: 'প্রশ্ন লিখে আবার পাঠাও।' },
        { status: 400 }
      )
    }

    const systemPrompt = getStudentSystemPrompt(
      body.classLevel || 'সাধারণ',
      body.name || 'শিক্ষার্থী',
      body.subjects
    )

    let response: string
    try {
      response = await chat(messages, systemPrompt)
    } catch (aiErr) {
      console.error('Groq chat failed:', aiErr)
      const msg =
        aiErr instanceof Error ? aiErr.message : 'AI service unavailable'
      return NextResponse.json(
        {
          error: 'AI_FAILED',
          response:
            'উত্তর তৈরি করা যায়নি। একটু পরে আবার চেষ্টা করো। (' +
            msg.slice(0, 120) +
            ')',
        },
        { status: 502 }
      )
    }

    if (!response?.trim()) {
      return NextResponse.json(
        {
          error: 'EMPTY_AI',
          response: 'AI খালি উত্তর দিয়েছে। আবার চেষ্টা করো।',
        },
        { status: 502 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    try {
      await supabase.from('ai_conversations').insert([
        {
          user_id: user.id,
          role: 'user',
          content: lastMessage?.content ?? '',
          context: { classLevel: body.classLevel, subjects: body.subjects },
        },
        {
          user_id: user.id,
          role: 'assistant',
          content: response,
          context: { classLevel: body.classLevel, subjects: body.subjects },
        },
      ])
    } catch (saveErr) {
      console.error('ai_conversations save failed', saveErr)
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Internal server error',
        response: 'সার্ভারে সমস্যা হয়েছে। (' + msg.slice(0, 100) + ')',
      },
      { status: 500 }
    )
  }
}
