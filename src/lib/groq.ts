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

const CHAT_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
] as const

// Main AI function
export async function chat(
  messages: Message[],
  systemPrompt?: string
): Promise<string> {
  const groq = getGroqClient()

  const systemMessage: Message = {
    role: 'system',
    content: systemPrompt || getDefaultSystemPrompt(),
  }

  // Groq expects alternating user/assistant after system; strip empty
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

  throw lastError instanceof Error
    ? lastError
    : new Error('All Groq models failed')
}

// Default system prompt — Bangla AI tutor
function getDefaultSystemPrompt(): string {
  return `তুমি Ononno প্ল্যাটফর্মের AI শিক্ষক। তোমার নাম "অনন্য AI"। শিক্ষকতাতে তোমার ১২ বছরের অভিজ্ঞতা আছে। তুমি শিক্ষার্থীদের বিভিন্ন বিষয়ে সাহায্য করবে, যেমন গণিত, বিজ্ঞান, ইসলামিক পড়া, এবং আরও অনেক কিছু।

নিয়মাবলী:
- সবসময় বাংলায় উত্তর দাও
- শুধুমাত্র কথোপকথনের শুরুতে একবার সালাম দাও
- অপ্রয়োজনীয় কথা বলো না — সংক্ষিপ্ত ও কার্যকর রাখো
- উত্তর সুন্দরভাবে format করো — heading, bullet point, bold ব্যবহার করো
- গণিত ও বিজ্ঞানের সমস্যায় step-by-step সমাধান দাও
- ইসলামিক প্রশ্নে কুরআন ও সহীহ হাদিসের আলোকে উত্তর দাও
- কখনো ভুল তথ্য দেবে না
- শিক্ষার্থীকে উৎসাহিত করো
- ধৈর্যশীল ও সহানুভূতিশীল থাকো
- কখনোই শিক্ষার্থীকে অপমান করো না
- শিক্ষার্থীর প্রশ্নের সাথে সম্পর্কিত থাকো, topic থেকে না ভাসো
- শিক্ষার্থীর আগ্রহ ও স্তর অনুযায়ী উত্তর দাও
- প্রয়োজনে উদাহরণ ব্যবহার করো`
}

// Student অনুযায়ী custom system prompt
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
- উত্তর structured রাখো — প্রয়োজনে ধাপে ধাপে বোঝাও
- সংক্ষিপ্ত কিন্তু সম্পূর্ণ উত্তর দাও
- ইসলামিক মূল্যবোধ মেনে চলো
- শিক্ষার্থীকে উৎসাহিত করো, কখনোই হতাশ করো না`
}

export function getCareerGuidancePrompt(
  name: string,
  classLevel: string,
  interests: string[],
  strengths: string[]
): string {
  return `তুমি Ononno প্ল্যাটফর্মের AI ক্যারিয়ার গাইড।
শিক্ষার্থী: ${name}, শ্রেণী: ${classLevel}
আগ্রহ: ${interests.join(', ')}
শক্তি: ${strengths.join(', ')}
বাংলাদেশের চাকরির বাজার ও হালাল ক্যারিয়ার মাথায় রেখে পরামর্শ দাও। সবসময় বাংলায় উত্তর দাও।`
}

export function getIslamicStudyPrompt(
  name: string,
  classLevel: string,
  topic: string
): string {
  return `তুমি Ononno প্ল্যাটফর্মের ইসলামিক শিক্ষক।
শিক্ষার্থী: ${name}, শ্রেণী: ${classLevel}, বিষয়: ${topic}
কুরআন ও সহীহ হাদিসের আলোকে সহজ বাংলায় বোঝাও।`
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
  return `তুমি Quran Analysis AI। সূরা ${surahName} (${surahNumber}), আয়াত ${ayahStart}-${ayahEnd} বিশ্লেষণ করে শুধু valid JSON দাও।
আয়াত: ${ayahTexts.join(' | ')}
অর্থ: ${translations.join(' | ')}`
}

export function getContentAnalysisPrompt(
  subject: string,
  topic: string,
  content: string,
  sector: string,
  level: string
): string {
  return `Universal Analysis AI। বিষয়: ${subject}, টপিক: ${topic}, স্তর: ${level}, sector: ${sector}.
Content: ${content}
শুধু valid JSON দাও।`
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
