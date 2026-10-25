'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * Kids Zone TTS
 * - bn-BD / ar-SA: /api/tts (Google) via blob + session cache
 * - en-US: Web Speech first, then /api/tts
 * - unlockSpeechAudio() on first user gesture (autoplay policy)
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
  // GK / everyday words — clearer for kids TTS
  লাল: 'লাল',
  নীল: 'নীল',
  সবুজ: 'সবুজ',
  হলুদ: 'হলুদ',
  কমলা: 'কমলা',
  বেগুনি: 'বেগুনি',
  সাদা: 'সাদা',
  কালো: 'কালো',
  আম: 'আম',
  কলা: 'কলা',
  আপেল: 'আপেল',
  তরমুজ: 'তরমুজ',
  আঙ্গুর: 'আঙ্গুর',
  কাঁঠাল: 'কাঁঠাল',
  পেয়ারা: 'পেয়ারা',
  বাঘ: 'বাঘ',
  হাতি: 'হাতি',
  গরু: 'গরু',
  বিড়াল: 'বিড়াল',
  কুকুর: 'কুকুর',
  পাখি: 'পাখি',
  মাছ: 'মাছ',
  খরগোশ: 'খরগোশ',
  চোখ: 'চোখ',
  কান: 'কান',
  হাত: 'হাত',
  পা: 'পা',
  নাক: 'নাক',
  মুখ: 'মুখ',
  বাস: 'বাস',
  গাড়ি: 'গাড়ি',
  ট্রেন: 'ট্রেন',
  নৌকা: 'নৌকা',
  বিমান: 'বিমান',
  রিকশা: 'রিকশা',
  পতাকা: 'পতাকা',
  ঢাকা: 'ঢাকা',
  শাপলা: 'শাপলা',
  দোয়েল: 'দোয়েল',
  ইলিশ: 'ইলিশ',
  বাংলা: 'বাংলা',
  গ্রীষ্ম: 'গ্রীষ্ম',
  বর্ষা: 'বর্ষা',
  শীত: 'শীত',
  বসন্ত: 'বসন্ত',
  ডাক্তার: 'ডাক্তার',
  শিক্ষক: 'শিক্ষক',
  কৃষক: 'কৃষক',
  পুলিশ: 'পুলিশ',
  চালক: 'চালক',
  সূর্য: 'সূর্য',
  চাঁদ: 'চাঁদ',
  মেঘ: 'মেঘ',
  বৃষ্টি: 'বৃষ্টি',
  তারা: 'তারা',
  শাবাশ: 'শাবাশ! দারুণ হয়েছে!',
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

/** Session-level blob cache so replay is instant */
const ttsCache = new Map<string, string>()

function cacheKey(text: string, lang: string) {
  return `${lang}::${text}`
}

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
  if (!t) return t

  if (lang === 'bn-BD') {
    if (BANGLA_PRONUNCIATION[t]) return BANGLA_PRONUNCIATION[t]
    // Single Bangla letter inside longer phrase: leave as-is for full sentence TTS
    if (t.length === 1 && BANGLA_PRONUNCIATION[t]) return BANGLA_PRONUNCIATION[t]
  }
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
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (Ctx) {
      const ctx = new Ctx()
      if (ctx.state === 'suspended') void ctx.resume()
      // silent buffer tick
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
    }
  } catch {
    /* ignore */
  }
  try {
    const a = new Audio()
    a.src =
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='
    a.volume = 0.01
    void a
      .play()
      .then(() => {
        a.pause()
        audioUnlocked = true
      })
      .catch(() => {
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
    // Don't revoke cache URLs — only non-cached ephemeral ones
    blobUrlRef.current = null
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
        // Slower for kids
        utterance.rate = lang === 'en-US' ? 0.85 : 0.75
        utterance.pitch = 1.08
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

  const playBlobUrl = useCallback((url: string, ttsLang: string, myGen: number) => {
    const audio = new Audio()
    audioRef.current = audio
    audio.preload = 'auto'
    // Slightly slower feel via playbackRate for kids
    audio.playbackRate = ttsLang === 'en' ? 0.95 : 0.9

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
            ? '▶️ আরবি উচ্চারণ'
            : ttsLang === 'en'
              ? '▶️ English'
              : '▶️ বাংলা উচ্চারণ',
      })
      void audio.play().catch(onFail)
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
  }, [])

  const speakViaApiTts = useCallback(
    async (speakText: string, lang: SpeechLang, attempt = 1) => {
      const ttsLang = lang === 'ar-SA' ? 'ar' : lang === 'en-US' ? 'en' : 'bn'
      const key = cacheKey(speakText, ttsLang)
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
        let url = ttsCache.get(key)
        if (!url) {
          const apiUrl = `/api/tts?text=${encodeURIComponent(speakText)}&lang=${ttsLang}`
          const res = await fetch(apiUrl, { cache: 'force-cache' })
          if (!res.ok) throw new Error(`TTS ${res.status}`)
          const blob = await res.blob()
          if (blob.size < 100) throw new Error('empty audio')
          if (myGen !== genRef.current) return
          url = URL.createObjectURL(blob)
          ttsCache.set(key, url)
          // Cap cache size
          if (ttsCache.size > 80) {
            const first = ttsCache.keys().next().value
            if (first) {
              const old = ttsCache.get(first)
              ttsCache.delete(first)
              if (old) try { URL.revokeObjectURL(old) } catch { /* */ }
            }
          }
        }
        if (myGen !== genRef.current) return
        blobUrlRef.current = url
        playBlobUrl(url, ttsLang, myGen)
      } catch {
        if (myGen !== genRef.current) return
        if (attempt < 2) {
          // one automatic retry after short delay
          setTimeout(() => {
            if (myGen !== genRef.current) return
            void speakViaApiTts(speakText, lang, attempt + 1)
          }, 400)
          return
        }
        setIsSpeaking(false)
        setIsLoading(false)
        setStatus({
          phase: 'error',
          message: 'অডিও লোড হয়নি। 🔊 আবার চেষ্টা করো।',
        })
      }
    },
    [playBlobUrl],
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
