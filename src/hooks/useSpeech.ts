'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * Kids Zone TTS
 * - bn-BD / ar-SA: /api/tts (Google) — stable Bangla & Arabic
 * - en-US: Web Speech first, then /api/tts fallback
 * - Uses blob URLs so playback is more reliable than streaming Audio(src=api)
 * - unlockAudio() must run on first user tap (browser autoplay policy)
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

/** Shared unlock — call on first user tap so later autoplay works. */
let audioUnlocked = false

export function unlockSpeechAudio() {
  if (typeof window === 'undefined' || audioUnlocked) return
  try {
    const a = new Audio()
    a.src =
      'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+1DEAAAGAAGn9AAAIgAANP8AAABEwPMWTgIANq9AAAAAAAA9DWppbk1UPj8uOjo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Oj/////////+1DEDsP1AAn9AAAIgAANP8AAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAAAAAAgAAAA0gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='
    a.volume = 0.01
    void a.play().then(() => {
      a.pause()
      audioUnlocked = true
    }).catch(() => {
      /* still mark attempted */
      audioUnlocked = true
    })
  } catch {
    audioUnlocked = true
  }
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<SpeechStatus>({ phase: 'idle' })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)
  const genRef = useRef(0)

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
    genRef.current += 1
    if (typeof window === 'undefined') return
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
      } catch {
        /* ignore */
      }
      audioRef.current = null
    }
    if (blobUrlRef.current) {
      try {
        URL.revokeObjectURL(blobUrlRef.current)
      } catch {
        /* ignore */
      }
      blobUrlRef.current = null
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

        const myGen = genRef.current
        utterance.onstart = () => {
          if (myGen !== genRef.current) return
          setIsSpeaking(true)
          setIsLoading(false)
          setStatus({ phase: 'playing', message: '🔊 শুনছো…' })
        }
        utterance.onend = () => {
          if (myGen !== genRef.current) return
          setIsSpeaking(false)
          setStatus({ phase: 'idle' })
        }
        utterance.onerror = () => {
          if (myGen !== genRef.current) return
          setIsSpeaking(false)
          setStatus({ phase: 'error', message: 'Web Speech ব্যর্থ' })
        }

        window.speechSynthesis.cancel()
        setTimeout(() => {
          if (myGen !== genRef.current) return
          window.speechSynthesis.speak(utterance)
        }, 40)
        return true
      } catch {
        return false
      }
    },
    [ensureVoices],
  )

  const speakViaApiTts = useCallback(
    async (speakText: string, lang: SpeechLang) => {
      const ttsLang = lang === 'ar-SA' ? 'ar' : lang === 'en-US' ? 'en' : 'bn'
      const apiUrl = `/api/tts?text=${encodeURIComponent(speakText)}&lang=${ttsLang}`
      const myGen = genRef.current

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

      try {
        const res = await fetch(apiUrl, { cache: 'force-cache' })
        if (!res.ok) throw new Error(`TTS ${res.status}`)
        const blob = await res.blob()
        if (blob.size < 100) throw new Error('empty audio')
        if (myGen !== genRef.current) return

        if (blobUrlRef.current) {
          try {
            URL.revokeObjectURL(blobUrlRef.current)
          } catch {
            /* */
          }
        }
        const url = URL.createObjectURL(blob)
        blobUrlRef.current = url

        const audio = new Audio()
        audioRef.current = audio
        audio.preload = 'auto'

        const onFail = () => {
          if (myGen !== genRef.current) return
          setIsSpeaking(false)
          setIsLoading(false)
          setStatus({
            phase: 'error',
            message: 'অডিও চালু হয়নি — 🔊 বাটনে চাপ দাও',
          })
          audioRef.current = null
        }

        audio.oncanplaythrough = () => {
          if (myGen !== genRef.current) return
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
        }
        audio.onended = () => {
          if (myGen !== genRef.current) return
          setIsSpeaking(false)
          setIsLoading(false)
          setStatus({ phase: 'idle' })
          audioRef.current = null
        }
        audio.onerror = onFail
        audio.src = url
        audio.load()
      } catch {
        if (myGen !== genRef.current) return
        setIsSpeaking(false)
        setIsLoading(false)
        setStatus({
          phase: 'error',
          message: 'অডিও লোড হয়নি। 🔊 আবার চেষ্টা করো।',
        })
      }
    },
    [],
  )

  const speak = useCallback(
    (text: string, lang: SpeechLang = 'bn-BD') => {
      if (typeof window === 'undefined' || !text?.trim()) return

      unlockSpeechAudio()
      stop()
      const speakText = expandText(text, lang)

      if (lang === 'en-US') {
        if (!speakViaWebSpeech(speakText, lang)) {
          void speakViaApiTts(speakText, lang)
        }
        return
      }

      // Bangla & Arabic → Google TTS API (blob playback)
      void speakViaApiTts(speakText, lang)
    },
    [stop, speakViaWebSpeech, speakViaApiTts],
  )

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    status,
    unlock: unlockSpeechAudio,
    webSpeechSupported:
      typeof window !== 'undefined' && 'speechSynthesis' in window,
  }
}
