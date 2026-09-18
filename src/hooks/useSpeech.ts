'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * Kids Zone TTS
 * - en-US: Web Speech API
 * - bn-BD: always /api/tts (Google bn) — browsers often fall back to Hindi
 * - ar-SA: Web Speech if Arabic voice exists, else /api/tts
 */

const BANGLA_PRONUNCIATION: Record<string, string> = {
  অ: 'অ অজগর',
  আ: 'আ আম',
  ই: 'ই ইলিশ',
  ঈ: 'ঈ ঈগল',
  উ: 'উ উট',
  ঊ: 'ঊ ঊষা',
  ঋ: 'ঋ ঋষি',
  এ: 'এ একতারা',
  ঐ: 'ঐ ঐরাবত',
  ও: 'ও ওল',
  ঔ: 'ঔ ঔষধ',
  ক: 'ক কলা',
  খ: 'খ খরগোশ',
  গ: 'গ গরু',
  ঘ: 'ঘ ঘড়ি',
  চ: 'চ চাঁদ',
  ছ: 'ছ ছাগল',
  জ: 'জ জাম',
  ঝ: 'ঝ ঝড়',
  ট: 'ট টমেটো',
  ড: 'ড ডাব',
  ণ: 'ণ মণি',
  ত: 'ত তরমুজ',
  দ: 'দ দাঁত',
  ন: 'ন নৌকা',
  প: 'প পাখি',
  ফ: 'ফ ফুল',
  ব: 'ব বাঘ',
  ভ: 'ভ ভালুক',
  ম: 'ম মাছ',
  য: 'য যাত্রী',
  র: 'র রকেট',
  ল: 'ল লাল',
  শ: 'শ শাপলা',
  স: 'স সাপ',
  হ: 'হ হাতি',
  '১': 'এক',
  '২': 'দুই',
  '৩': 'তিন',
  '৪': 'চার',
  '৫': 'পাঁচ',
  '৬': 'ছয়',
  '৭': 'সাত',
  '৮': 'আট',
  '৯': 'নয়',
  '১০': 'দশ',
}

const ARABIC_LETTER_NAME: Record<string, string> = {
  ا: 'আলিফ',
  ب: 'বা',
  ت: 'তা',
  ث: 'সা',
  ج: 'জিম',
  ح: 'হা',
  خ: 'খা',
  د: 'দাল',
  ذ: 'যাল',
  ر: 'রা',
  ز: 'যাই',
  س: 'সিন',
  ش: 'শিন',
  ص: 'সোয়াদ',
  ض: 'দোয়াদ',
  ط: 'তোয়া',
  ظ: 'যোয়া',
  ع: 'আইন',
  غ: 'গাইন',
  ف: 'ফা',
  ق: 'কাফ',
  ك: 'কাফ',
  ل: 'লাম',
  م: 'মিম',
  ن: 'নুন',
  ه: 'হা',
  و: 'ওয়াও',
  ي: 'ইয়া',
}

export type SpeechLang = 'bn-BD' | 'en-US' | 'ar-SA'

export type SpeechStatus =
  | { phase: 'idle' }
  | { phase: 'loading'; message: string }
  | { phase: 'playing'; message: string }
  | { phase: 'error'; message: string }

/** Only real Bangla / Arabic / English — never Hindi (hi). */
function pickVoice(lang: SpeechLang): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const prefixes =
    lang === 'en-US'
      ? ['en-US', 'en-GB', 'en']
      : lang === 'ar-SA'
        ? ['ar-SA', 'ar-EG', 'ar-AE', 'ar']
        : ['bn-BD', 'bn-IN', 'bn']

  for (const p of prefixes) {
    const found = voices.find((v) => {
      const l = v.lang.toLowerCase()
      const name = (v.name || '').toLowerCase()
      if (l.startsWith('hi') || name.includes('hindi')) return false
      return l === p.toLowerCase() || l.startsWith(p.toLowerCase())
    })
    if (found) return found
  }
  return null
}

function expandText(text: string, lang: SpeechLang): string {
  const t = text.trim()
  if (lang === 'bn-BD' && BANGLA_PRONUNCIATION[t]) return BANGLA_PRONUNCIATION[t]
  if (lang === 'ar-SA' && t.length === 1 && ARABIC_LETTER_NAME[t]) {
    return ARABIC_LETTER_NAME[t]
  }
  return t
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<SpeechStatus>({ phase: 'idle' })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const ensureVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const load = () => {
      window.speechSynthesis.getVoices()
    }
    load()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.src = ''
      } catch {
        /* ignore */
      }
      audioRef.current = null
    }
    setIsSpeaking(false)
    setIsLoading(false)
    setStatus({ phase: 'idle' })
  }, [])

  const speakViaWebSpeech = useCallback(
    (speakText: string, lang: SpeechLang): boolean => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return false
      ensureVoices()

      const voice = pickVoice(lang)
      if (lang === 'bn-BD' && !voice) return false
      if (lang === 'ar-SA' && !voice) return false

      try {
        const utterance = new SpeechSynthesisUtterance(speakText)
        utterance.lang =
          lang === 'en-US' ? 'en-US' : lang === 'ar-SA' ? 'ar-SA' : 'bn-BD'
        utterance.rate = lang === 'en-US' ? 0.9 : 0.85
        utterance.pitch = 1.05
        utterance.volume = 1
        if (voice) utterance.voice = voice

        utterance.onstart = () => {
          setIsSpeaking(true)
          setIsLoading(false)
          setStatus({ phase: 'playing', message: '🔊 শুনছো…' })
        }
        utterance.onend = () => {
          setIsSpeaking(false)
          setStatus({ phase: 'idle' })
        }
        utterance.onerror = () => {
          setIsSpeaking(false)
          setStatus({ phase: 'error', message: 'Web Speech ব্যর্থ' })
        }

        window.speechSynthesis.cancel()
        setTimeout(() => {
          window.speechSynthesis.speak(utterance)
        }, 40)
        return true
      } catch {
        return false
      }
    },
    [ensureVoices],
  )

  const speakViaApiTts = useCallback((speakText: string, lang: SpeechLang) => {
    const ttsLang = lang === 'ar-SA' ? 'ar' : lang === 'en-US' ? 'en' : 'bn'
    const apiUrl = `/api/tts?text=${encodeURIComponent(speakText)}&lang=${ttsLang}`

    setIsLoading(true)
    setIsSpeaking(true)
    setStatus({
      phase: 'loading',
      message:
        ttsLang === 'ar'
          ? '⬇️ আরবি অডিও…'
          : ttsLang === 'en'
            ? '⬇️ English audio…'
            : '⬇️ বাংলা উচ্চারণ…',
    })

    const audio = new Audio()
    audioRef.current = audio
    audio.preload = 'auto'

    const onFail = () => {
      setIsSpeaking(false)
      setIsLoading(false)
      setStatus({
        phase: 'error',
        message: 'অডিও লোড হয়নি। আবার চেষ্টা করো।',
      })
      audioRef.current = null
    }

    audio.addEventListener('canplaythrough', () => {
      setIsLoading(false)
      setStatus({
        phase: 'playing',
        message:
          ttsLang === 'ar'
            ? '▶️ আরবি'
            : ttsLang === 'en'
              ? '▶️ English'
              : '▶️ বাংলা উচ্চারণ',
      })
      audio.play().catch(onFail)
    })
    audio.addEventListener('ended', () => {
      setIsSpeaking(false)
      setIsLoading(false)
      setStatus({ phase: 'idle' })
      audioRef.current = null
    })
    audio.addEventListener('error', onFail)
    audio.src = apiUrl
    audio.load()
  }, [])

  const speak = useCallback(
    (text: string, lang: SpeechLang = 'bn-BD') => {
      if (typeof window === 'undefined' || !text?.trim()) return

      stop()
      const speakText = expandText(text, lang)

      if (lang === 'en-US') {
        if (!speakViaWebSpeech(speakText, lang)) {
          setStatus({ phase: 'error', message: 'English voice পাওয়া যায়নি' })
        }
        return
      }

      // Bangla → always Google TTS (lang=bn). Device Web Speech often uses Hindi.
      if (lang === 'bn-BD') {
        speakViaApiTts(speakText, lang)
        return
      }

      ensureVoices()
      if (pickVoice('ar-SA') && speakViaWebSpeech(speakText, 'ar-SA')) return
      speakViaApiTts(speakText, 'ar-SA')
    },
    [stop, speakViaWebSpeech, speakViaApiTts, ensureVoices],
  )

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    status,
    webSpeechSupported:
      typeof window !== 'undefined' && 'speechSynthesis' in window,
  }
}
