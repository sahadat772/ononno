import { useCallback, useEffect, useState } from 'react'

// ── Pre-defined letter pronunciations ─────────────────────────────────────────
// Browser voice না থাকলে এই text দিয়ে Groq TTS call করবো

const BANGLA_VOICE_TEXT: Record<string, string> = {
    'অ': 'অ - অজগর', 'আ': 'আ - আম', 'ই': 'ই - ইলিশ',
    'ঈ': 'ঈ - ঈগল', 'উ': 'উ - উট', 'ঊ': 'ঊ - ঊষা',
    'ঋ': 'ঋ - ঋষি', 'এ': 'এ - একতারা', 'ঐ': 'ঐ - ঐরাবত',
    'ও': 'ও - ওল', 'ঔ': 'ঔ - ঔষধ',
    'ক': 'ক - কলা', 'খ': 'খ - খরগোশ', 'গ': 'গ - গরু',
    'ঘ': 'ঘ - ঘড়ি', 'ঙ': 'ঙ - বাঙ', 'চ': 'চ - চাঁদ',
    'ছ': 'ছ - ছাগল', 'জ': 'জ - জাম', 'ঝ': 'ঝ - ঝড়',
    'ট': 'ট - টমেটো', 'ড': 'ড - ডাব', 'ণ': 'ণ - মণি',
    'ত': 'ত - তরমুজ', 'দ': 'দ - দাঁত', 'ন': 'ন - নৌকা',
    'প': 'প - পাখি', 'ফ': 'ফ - ফুল', 'ব': 'ব - বাঘ',
    'ভ': 'ভ - ভালুক', 'ম': 'ম - মাছ', 'য': 'য - যাত্রী',
    'র': 'র - রকেট', 'ল': 'ল - লাল', 'শ': 'শ - শাপলা',
    'স': 'স - সাপ', 'হ': 'হ - হাতি',
    '১': 'এক', '২': 'দুই', '৩': 'তিন', '৪': 'চার', '৫': 'পাঁচ',
    '৬': 'ছয়', '৭': 'সাত', '৮': 'আট', '৯': 'নয়', '১০': 'দশ',
}

const ARABIC_VOICE_TEXT: Record<string, string> = {
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
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return
        const load = () => setVoices(window.speechSynthesis.getVoices())
        load()
        window.speechSynthesis.onvoiceschanged = load
    }, [])

    // ── Browser TTS (English এর জন্য) ─────────────────────────────────────────
    const speakWithBrowser = useCallback((text: string, lang: string) => {
        if (typeof window === 'undefined') return false

        const voice = voices.find(v => v.lang === lang)
            || voices.find(v => v.lang.startsWith(lang.split('-')[0]))

        if (!voice && lang !== 'en-US') return false

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        if (voice) utterance.voice = voice
        utterance.lang = lang
        utterance.rate = 0.8
        utterance.pitch = 1.1

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
        return true
    }, [voices])

    // ── Groq TTS (বাংলা ও Arabic এর জন্য) ────────────────────────────────────
    const speakWithGroq = useCallback(async (text: string, lang: 'bn-BD' | 'ar-SA') => {
        setIsLoading(true)
        setIsSpeaking(true)

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, lang }),
            })

            if (!response.ok) throw new Error('TTS failed')

            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)

            audio.onended = () => {
                setIsSpeaking(false)
                URL.revokeObjectURL(audioUrl)
            }
            audio.onerror = () => setIsSpeaking(false)

            await audio.play()
        } catch {
            // Fallback — browser TTS দিয়ে try করো
            speakWithBrowser(text, lang)
            setIsSpeaking(false)
        } finally {
            setIsLoading(false)
        }
    }, [speakWithBrowser])

    // ── Main speak function ───────────────────────────────────────────────────
    const speak = useCallback((
        text: string,
        lang: 'bn-BD' | 'en-US' | 'ar-SA' = 'bn-BD'
    ) => {
        if (typeof window === 'undefined') return

        // English → browser TTS (সবসময় কাজ করে)
        if (lang === 'en-US') {
            speakWithBrowser(text, 'en-US')
            return
        }

        // বাংলা → letter pronunciation map check করো
        const banglaText = BANGLA_VOICE_TEXT[text] || text
        const arabicText = ARABIC_VOICE_TEXT[text] || text

        // আগে browser এ try করো
        const browserWorked = speakWithBrowser(
            lang === 'bn-BD' ? banglaText : arabicText,
            lang
        )

        // Browser কাজ না করলে Groq TTS use করো
        if (!browserWorked) {
            speakWithGroq(
                lang === 'bn-BD' ? banglaText : arabicText,
                lang
            )
        }
    }, [speakWithBrowser, speakWithGroq])

    const stop = useCallback(() => {
        if (typeof window === 'undefined') return
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }, [])

    return { speak, stop, isSpeaking, isLoading }
}