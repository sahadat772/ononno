export type UserRole =
    | 'student'
    | 'parent'
    | 'teacher'
    | 'admin'
    | 'skill_learner'
    | 'adult_learner'

export type Religion = 'muslim' | 'hindu' | 'christian' | 'buddhist' | 'other'

export type FreeReason = 'orphan' | 'poor' | 'disabled'

export type ClassLevel =
    | 'nursery' | 'class_1' | 'class_2' | 'class_3' | 'class_4' | 'class_5'
    | 'class_6' | 'class_7' | 'class_8' | 'class_9' | 'class_10'
    | 'class_11' | 'class_12' | 'university' | 'masters'

export type SubjectCategory = 'academic' | 'islamic' | 'training' | 'skill'

export type ContentType = 'text' | 'video' | 'audio' | 'quiz'

export type SubscriptionPlan =
    | 'free'
    | 'student_99' | 'student_199' | 'student_299'
    | 'student_399' | 'student_499' | 'student_599'
    | 'skill_basic' | 'skill_pro' | 'skill_enterprise'
    | 'adult_learner' | 'family'

export type Profile = {
    id: string
    full_name: string
    email: string
    phone: string | null
    role: UserRole
    religion: Religion
    is_free_tier: boolean
    free_reason: FreeReason | null
    verified: boolean
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export type StudentProfile = {
    id: string
    user_id: string
    date_of_birth: string | null
    gender: string | null
    class_level: ClassLevel
    school_name: string | null
    parent_id: string | null
    subscription_plan: SubscriptionPlan
    subscription_expires_at: string | null
    psychology_profile: Record<string, unknown>
    career_suggestion: Record<string, unknown>
    created_at: string
}

export type Subject = {
    id: string
    name: string
    name_bn: string
    class_level: ClassLevel
    category: SubjectCategory
    is_mandatory: boolean
    description: string | null
    thumbnail_url: string | null
    order_index: number
    created_at: string
}

export type Lesson = {
    id: string
    subject_id: string
    title: string
    title_bn: string
    content: string | null
    content_type: ContentType
    video_url: string | null
    duration_minutes: number | null
    order_index: number
    is_free_preview: boolean
    created_at: string
}

export type StudentProgress = {
    id: string
    user_id: string
    lesson_id: string
    completed: boolean
    score: number
    stars: number
    completed_at: string | null
    created_at: string
}

export type Quiz = {
    id: string
    lesson_id: string
    question: string
    options: Record<string, string>
    correct_answer: string
    explanation: string | null
    difficulty: 'easy' | 'medium' | 'hard'
    created_at: string
}

export type Subscription = {
    id: string
    user_id: string
    plan_type: SubscriptionPlan
    amount: number | null
    currency: string
    status: 'active' | 'expired' | 'cancelled'
    payment_method: string | null
    starts_at: string
    expires_at: string | null
    created_at: string
}

export type AIConversation = {
    id: string
    user_id: string
    role: 'user' | 'assistant'
    content: string
    context: Record<string, unknown>
    created_at: string
}

export type FreeAccessRequest = {
    id: string
    user_id: string
    reason_type: FreeReason
    document_url: string | null
    status: 'pending' | 'approved' | 'rejected'
    verified_by: string | null
    verified_at: string | null
    created_at: string
}

// ============================================================
// PART 3 — Islamic Module Types
// ============================================================

export type IslamicContentType =
    | 'quran'
    | 'hadith'
    | 'dua'
    | 'kalima'
    | 'tajweed'

export type IslamicProgressStatus =
    | 'not_started'
    | 'in_progress'
    | 'completed'

export type TajweedRuleId =
    | 'ghunna'
    | 'ikhfa'
    | 'idgham'
    | 'iqlab'
    | 'madd'
    | 'qalqalah'

export type IslamicQATopic =
    | 'fiqh'
    | 'aqeedah'
    | 'quran'
    | 'hadith'
    | 'seerah'
    | 'dua'
    | 'general'

export type KidsIslamicType =
    | 'kalima'
    | 'dua'
    | 'surah'

export type KidsIslamicLevel =
    | 'nursery'
    | 'kg'

// islamic_progress table
export type IslamicProgress = {
    id: string
    student_id: string
    content_type: IslamicContentType
    content_id: string
    status: IslamicProgressStatus
    score: number | null
    attempts: number
    last_practiced_at: string | null
    created_at: string
}

// quran_memorization table
export type QuranMemorization = {
    id: string
    student_id: string
    surah_number: number
    ayah_from: number
    ayah_to: number
    memorization_level: 0 | 1 | 2 | 3 | 4 | 5
    last_revised_at: string | null
    next_revision_at: string | null
    audio_recording_url: string | null
    ai_score: number | null
    ai_feedback: string | null
    created_at: string
}

// tajweed_sessions table
export type TajweedMistake = {
    word: string
    error: string
    correction: string
}

export type TajweedSession = {
    id: string
    student_id: string
    rule_id: TajweedRuleId
    ayah_text: string | null
    audio_url: string | null
    ai_feedback: string | null
    ai_score: number | null
    mistakes: TajweedMistake[] | null
    created_at: string
}

// islamic_qa_history table
export type IslamicQASource = {
    type: 'quran' | 'hadith'
    ref: string
    text: string
}

export type IslamicQAHistory = {
    id: string
    student_id: string
    question: string
    answer: string
    topic: IslamicQATopic | null
    sources: IslamicQASource[] | null
    created_at: string
}

// kids_islamic_lessons table
export type KidsIslamicLesson = {
    id: string
    type: KidsIslamicType
    title: string
    title_bn: string
    arabic_text: string
    bangla_translation: string
    pronunciation: string | null
    audio_url: string | null
    order_index: number
    level: KidsIslamicLevel
    is_active: boolean
    created_at: string
}

// daily_islamic_tracker table
export type DailyIslamicTracker = {
    id: string
    student_id: string
    date: string
    quran_ayahs_read: number
    duas_recited: number
    hadith_read: number
    tajweed_practiced: boolean
    memorization_done: boolean
    fajr_reminder: boolean
    daily_streak: number
    created_at: string
}

// ── ML Analysis Types ─────────────────────────────────────

// Weekly Islamic progress — ML analysis output
export type IslamicWeeklyAnalysis = {
    student_id: string
    week_start: string
    week_end: string
    quran_ayahs_total: number
    tajweed_avg_score: number
    memorization_levels: Record<string, number>
    daily_streak: number
    weak_tajweed_rules: TajweedRuleId[]
    ai_recommendations: string[]
    parent_report: string
}

// Spaced repetition schedule
export type RevisionSchedule = {
    surah_number: number
    ayah_from: number
    ayah_to: number
    memorization_level: number
    next_revision_at: string
    overdue: boolean
    days_overdue: number
}