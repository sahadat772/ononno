import { useCallback, useState } from 'react'

// ── Google Translate TTS (Free, No API Key) ───────────────────────────────────

function googleTTS(text: string, lang: string): HTMLAudioElement {
    const encoded = encodeURIComponent(text)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`
    return new Audio(url)
}

// ── Letter pronunciation map ──────────────────────────────────────────────────

const BANGLA_PRONUNCIATION: Record<string, string> = {
    'অ': 'অ দিয়ে অজগর', 'আ': 'আ দিয়ে আম', 'ই': 'ই দিয়ে ইলিশ',
    'ঈ': 'ঈ দিয়ে ঈগল', 'উ': 'উ দিয়ে উট', 'ঊ': 'ঊ দিয়ে ঊষা',
    'ঋ': 'ঋ দিয়ে ঋষি', 'এ': 'এ দিয়ে একতারা', 'ঐ': 'ঐ দিয়ে ঐরাবত',
    'ও': 'ও দিয়ে ওল', 'ঔ': 'ঔ দিয়ে ঔষধ',
    'ক': 'ক দিয়ে কলা', 'খ': 'খ দিয়ে খরগোশ', 'গ': 'গ দিয়ে গরু',
    'ঘ': 'ঘ দিয়ে ঘড়ি', 'ঙ': 'ঙ দিয়ে বাঙ', 'চ': 'চ দিয়ে চাঁদ',
    'ছ': 'ছ দিয়ে ছাগল', 'জ': 'জ দিয়ে জাম', 'ঝ': 'ঝ দিয়ে ঝড়',
    'ট': 'ট দিয়ে টমেটো', 'ড': 'ড দিয়ে ডাব', 'ণ': 'ণ দিয়ে মণি',
    'ত': 'ত দিয়ে তরমুজ', 'দ': 'দ দিয়ে দাঁত', 'ন': 'ন দিয়ে নৌকা',
    'প': 'প দিয়ে পাখি', 'ফ': 'ফ দিয়ে ফুল', 'ব': 'ব দিয়ে বাঘ',
    'ভ': 'ভ দিয়ে ভালুক', 'ম': 'ম দিয়ে মাছ', 'য': 'য দিয়ে যাত্রী',
    'র': 'র দিয়ে রকেট', 'ল': 'ল দিয়ে লাল', 'শ': 'শ দিয়ে শাপলা',
    'স': 'স দিয়ে সাপ', 'হ': 'হ দিয়ে হাতি',
    '১': 'এক', '২': 'দুই', '৩': 'তিন', '৪': 'চার', '৫': 'পাঁচ',
    '৬': 'ছয়', '৭': 'সাত', '৮': 'আট', '৯': 'নয়', '১০': 'দশ',
    'এক': 'এক', 'দুই': 'দুই', 'তিন': 'তিন', 'চার': 'চার', 'পাঁচ': 'পাঁচ',
}

const ARABIC_PRONUNCIATION: Record<string, string> = {
    'ا': 'ألف', 'ب': 'باء', 'ت': 'تاء', 'ث': 'ثاء',
    'ج': 'جيم', 'ح': 'حاء', 'خ': 'خاء', 'د': 'دال',
    'ذ': 'ذال', 'ر': 'راء', 'ز': 'زاي', 'س': 'سين',
    'ش': 'شين', 'ص': 'صاد', 'ض': 'ضاد', 'ط': 'طاء',
    'ظ': 'ظاء', 'ع': 'عين', 'غ': 'غين', 'ف': 'فاء',
    'ق': 'قاف', 'ك': 'كاف', 'ل': 'لام', 'م': 'ميم',
    'ن': 'نون', 'ه': 'هاء', 'و': 'واو', 'ي': 'ياء',
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const speak = useCallback((
        text: string,
        lang: 'bn-BD' | 'en-US' | 'ar-SA' = 'bn-BD'
    ) => {
        if (typeof window === 'undefined') return

        // Text map থেকে pronunciation নাও
        let speakText = text
        if (lang === 'bn-BD') {
            speakText = BANGLA_PRONUNCIATION[text] || text
        } else if (lang === 'ar-SA') {
            speakText = ARABIC_PRONUNCIATION[text] || text
        }

        // Google TTS lang code
        const ttsLang = lang === 'bn-BD' ? 'bn' : lang === 'ar-SA' ? 'ar' : 'en'

        setIsLoading(true)
        setIsSpeaking(true)

        const audio = googleTTS(speakText, ttsLang)

        audio.oncanplaythrough = () => {
            setIsLoading(false)
            audio.play().catch(() => {
                // Autoplay blocked — browser TTS fallback
                fallbackBrowserTTS(speakText, lang)
                setIsSpeaking(false)
            })
        }

        audio.onended = () => setIsSpeaking(false)

        audio.onerror = () => {
            setIsLoading(false)
            setIsSpeaking(false)
            // Fallback to browser TTS
            fallbackBrowserTTS(speakText, lang)
        }

        audio.load()
    }, [])

    const stop = useCallback(() => {
        setIsSpeaking(false)
    }, [])

    return { speak, stop, isSpeaking, isLoading }
}

// ── Browser TTS Fallback ──────────────────────────────────────────────────────

function fallbackBrowserTTS(text: string, lang: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.8
    utterance.pitch = 1.1
    window.speechSynthesis.speak(utterance)
}