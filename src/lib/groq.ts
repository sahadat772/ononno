import Groq from 'groq-sdk'

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set')
  }
  return new Groq({ apiKey })
}

export type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Prefer models commonly available on free/dev Groq keys
const CHAT_MODELS = [
  'llama-3.1-8b-instant',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
] as const

export async function chat(
  messages: Message[],
  systemPrompt?: string
): Promise<string> {
  const groq = getGroqClient()

  const systemMessage: Message = {
    role: 'system',
    content: systemPrompt || getDefaultSystemPrompt(),
  }

  const cleaned = messages
    .filter(
      (m) =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }))

  if (cleaned.length === 0) {
    throw new Error('No valid messages to send to AI')
  }

  let lastError: unknown
  for (const model of CHAT_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [systemMessage, ...cleaned],
        temperature: 0.7,
        max_tokens: 1024,
      })
      const text = response.choices[0]?.message?.content || ''
      if (text.trim()) return text
    } catch (err) {
      lastError = err
      console.error(`Groq model ${model} failed:`, err)
    }
  }

  const detail =
    lastError instanceof Error
      ? lastError.message
      : typeof lastError === 'object' && lastError && 'message' in lastError
        ? String((lastError as { message: unknown }).message)
        : 'All Groq models failed'

  throw new Error(detail)
}

function getDefaultSystemPrompt(): string {
  return `তুমি Ononno প্ল্যাটফর্মের AI শিক্ষক। তোমার নাম "অনন্য AI"।

নিয়মাবলী:
- সবসময় বাংলায় উত্তর দাও
- শুধুমাত্র কথোপকথনের শুরুতে একবার সালাম দাও
- সংক্ষিপ্ত ও কার্যকর রাখো
- ধাপে ধাপে বোঝাও
- শিক্ষার্থীকে উৎসাহিত করো`
}

export function getStudentSystemPrompt(
  classLevel: string,
  name: string,
  subjects?: string[]
): string {
  return `তুমি Ononno প্ল্যাটফর্মের AI শিক্ষক "অনন্য AI"।

শিক্ষার্থীর তথ্য:
- নাম: ${name}
- শ্রেণী: ${classLevel}
${subjects ? `- বিষয়: ${subjects.join(', ')}` : ''}

নিয়মাবলী:
- সবসময় বাংলায় উত্তর দাও
- প্রতিটি উত্তরে সালাম দেবে না — শুধু প্রথমবার
- ${classLevel} স্তরের উপযোগী সহজ ভাষায় বোঝাও
- ধাপে ধাপে বোঝাও
- সংক্ষিপ্ত কিন্তু সম্পূর্ণ উত্তর দাও
- শিক্ষার্থীকে উৎসাহিত করো`
}

export function getCareerGuidancePrompt(
  name: string,
  classLevel: string,
  interests: string[],
  strengths: string[]
): string {
  return `তুমি AI ক্যারিয়ার গাইড। শিক্ষার্থী: ${name}, শ্রেণী: ${classLevel}. আগ্রহ: ${interests.join(', ')}. শক্তি: ${strengths.join(', ')}. বাংলায় পরামর্শ দাও।`
}

export function getIslamicStudyPrompt(
  name: string,
  classLevel: string,
  topic: string
): string {
  return `তুমি ইসলামিক শিক্ষক। শিক্ষার্থী: ${name}, শ্রেণী: ${classLevel}, বিষয়: ${topic}. কুরআন ও সহীহ হাদিসের আলোকে সহজ বাংলায় বোঝাও।`
}

export interface AnalysisResult {
  mainLessons: string[]
  prophetExample: string
  scientificInsights: string
  lifeImpact: string
  sectorApplications: Record<string, string>
  researchFindings: string
  practicalSteps: string[]
}

export function getQuranAnalysisPrompt(
  surahName: string,
  surahNumber: number,
  ayahStart: number,
  ayahEnd: number,
  ayahTexts: string[],
  translations: string[]
): string {
  return `Quran Analysis AI। সূরা ${surahName} (${surahNumber}), আয়াত ${ayahStart}-${ayahEnd}. শুধু valid JSON দাও।\nআয়াত: ${ayahTexts.join(' | ')}\nঅর্থ: ${translations.join(' | ')}`
}

export function getContentAnalysisPrompt(
  subject: string,
  topic: string,
  content: string,
  sector: string,
  level: string
): string {
  return `Analysis AI। বিষয়: ${subject}, টপিক: ${topic}, স্তর: ${level}, sector: ${sector}. Content: ${content}. শুধু valid JSON দাও।`
}

export async function analyzeContent(
  prompt: string
): Promise<AnalysisResult | null> {
  try {
    const text = await chat(
      [{ role: 'user', content: prompt }],
      'তুমি বিশেষজ্ঞ বিশ্লেষক। সবসময় valid JSON দাও।'
    )
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0]) as AnalysisResult
  } catch {
    return null
  }
}
