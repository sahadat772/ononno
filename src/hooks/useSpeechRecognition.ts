'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

export type SpeechLang = 'bn-BD' | 'en-US' | 'ar-SA'

interface SpeechRecognitionHook {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  supported: boolean
  confidence: number
  startListening: (lang?: SpeechLang) => void
  stopListening: () => void
  resetTranscript: () => void
}

/** Bangla letter/word forms kids (or STT) might produce */
const BN_ALIASES: Record<string, string[]> = {
  অ: ['অ', 'অজগর', 'o', 'a'],
  আ: ['আ', 'আম', 'aa', 'a'],
  ই: ['ই', 'ইলিশ', 'i'],
  ঈ: ['ঈ', 'ঈগল'],
  উ: ['উ', 'উট', 'u'],
  ক: ['ক', 'কলা', 'ka', 'ko'],
  খ: ['খ', 'খরগোশ', 'kha'],
  গ: ['গ', 'গরু', 'ga', 'go'],
  ঘ: ['ঘ', 'ঘড়ি'],
  চ: ['চ', 'চাঁদ', 'cha'],
  ছ: ['ছ', 'ছাগল'],
  জ: ['জ', 'জাম'],
  ট: ['ট', 'টমেটো'],
  ত: ['ত', 'তরমুজ', 'ta', 'to'],
  দ: ['দ', 'দাঁত'],
  ন: ['ন', 'নৌকা', 'না', 'na', 'no'],
  প: ['প', 'পাখি', 'pa', 'po'],
  ফ: ['ফ', 'ফুল'],
  ব: ['ব', 'বাঘ', 'ba', 'bo'],
  ভ: ['ভ', 'ভালুক'],
  ম: ['ম', 'মাছ', 'ma', 'mo'],
  য: ['য', 'যাত্রী'],
  র: ['র', 'রকেট', 'ra', 'ro'],
  ল: ['ল', 'লাল', 'la', 'lo'],
  শ: ['শ', 'শাপলা'],
  স: ['স', 'সাপ', 'সা', 'sa', 'so'],
  হ: ['হ', 'হাতি', 'ha', 'ho'],
  // Colors
  লাল: ['লাল', 'lal', 'red', 'লাল রং'],
  নীল: ['নীল', 'nil', 'blue', 'নীল রং'],
  সবুজ: ['সবুজ', 'sobuj', 'green', 'সবুজ রং'],
  হলুদ: ['হলুদ', 'holud', 'yellow'],
  কমলা: ['কমলা', 'komola', 'orange'],
  বেগুনি: ['বেগুনি', 'beguni', 'purple'],
  সাদা: ['সাদা', 'sada', 'white'],
  কালো: ['কালো', 'kalo', 'black'],
  // Fruits
  আম: ['আম', 'aam', 'mango'],
  কলা: ['কলা', 'kola', 'banana'],
  আপেল: ['আপেল', 'apel', 'apple'],
  তরমুজ: ['তরমুজ', 'tormuj', 'watermelon'],
  আঙ্গুর: ['আঙ্গুর', 'angur', 'grape'],
  কাঁঠাল: ['কাঁঠাল', 'kathal', 'jackfruit'],
  পেয়ারা: ['পেয়ারা', 'peara', 'guava'],
  // Animals
  বাঘ: ['বাঘ', 'bagh', 'tiger'],
  হাতি: ['হাতি', 'hati', 'elephant'],
  গরু: ['গরু', 'goru', 'cow'],
  বিড়াল: ['বিড়াল', 'biral', 'cat'],
  কুকুর: ['কুকুর', 'kukur', 'dog'],
  পাখি: ['পাখি', 'pakhi', 'bird'],
  মাছ: ['মাছ', 'mach', 'fish'],
  খরগোশ: ['খরগোশ', 'khorgosh', 'rabbit'],
  // Body
  চোখ: ['চোখ', 'chokh', 'eye'],
  কান: ['কান', 'kan', 'ear'],
  হাত: ['হাত', 'hat', 'hand'],
  পা: ['পা', 'pa', 'foot', 'leg'],
  নাক: ['নাক', 'nak', 'nose'],
  মুখ: ['মুখ', 'mukh', 'mouth'],
  // Vehicles
  বাস: ['বাস', 'bus'],
  গাড়ি: ['গাড়ি', 'gari', 'car'],
  ট্রেন: ['ট্রেন', 'train'],
  নৌকা: ['নৌকা', 'nouka', 'boat'],
  বিমান: ['বিমান', 'biman', 'plane'],
  রিকশা: ['রিকশা', 'rickshaw'],
  // BD
  পতাকা: ['পতাকা', 'potaka', 'flag'],
  ঢাকা: ['ঢাকা', 'dhaka'],
  শাপলা: ['শাপলা', 'shapla'],
  দোয়েল: ['দোয়েল', 'doyel'],
  ইলিশ: ['ইলিশ', 'ilish'],
  বাংলা: ['বাংলা', 'bangla', 'bengali'],
  // Seasons / jobs / weather
  গ্রীষ্ম: ['গ্রীষ্ম', 'grismo', 'summer'],
  বর্ষা: ['বর্ষা', 'borsha', 'rainy'],
  শীত: ['শীত', 'sheet', 'winter'],
  বসন্ত: ['বসন্ত', 'boshonto', 'spring'],
  ডাক্তার: ['ডাক্তার', 'daktar', 'doctor'],
  শিক্ষক: ['শিক্ষক', 'shikkhok', 'teacher'],
  কৃষক: ['কৃষক', 'krishok', 'farmer'],
  পুলিশ: ['পুলিশ', 'police'],
  চালক: ['চালক', 'chalok', 'driver'],
  সূর্য: ['সূর্য', 'surjo', 'sun'],
  চাঁদ: ['চাঁদ', 'chad', 'moon'],
  মেঘ: ['মেঘ', 'megh', 'cloud'],
  বৃষ্টি: ['বৃষ্টি', 'brishti', 'rain'],
  তারা: ['তারা', 'tara', 'star'],
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const supported = useMemo(() => {
    if (typeof window === 'undefined') return false
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }, [])

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const recognitionRef = useRef<{ stop: () => void; abort?: () => void } | null>(null)
  const triedFallbackLang = useRef(false)

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort?.()
        recognitionRef.current?.stop()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const startListening = useCallback(
    (lang: SpeechLang = 'bn-BD') => {
      if (!supported) {
        setError('মাইক / Speech Recognition এই ব্রাউজারে নেই — Chrome ব্যবহার করো')
        return
      }

      try {
        recognitionRef.current?.abort?.()
        recognitionRef.current?.stop()
      } catch {
        /* ignore */
      }

      type SRInstance = {
        lang: string
        interimResults: boolean
        continuous: boolean
        maxAlternatives: number
        onstart: (() => void) | null
        onresult: ((e: {
          resultIndex: number
          results: ArrayLike<{
            isFinal?: boolean
            length: number
            [i: number]: { transcript: string; confidence: number }
          }>
        }) => void) | null
        onerror: ((e: { error: string }) => void) | null
        onend: (() => void) | null
        start: () => void
        stop: () => void
        abort: () => void
      }

      type SRCtor = new () => SRInstance

      const w = window as Window & {
        SpeechRecognition?: SRCtor
        webkitSpeechRecognition?: SRCtor
      }

      const SR = w.SpeechRecognition || w.webkitSpeechRecognition
      if (!SR) {
        setError('SpeechRecognition পাওয়া যায়নি')
        return
      }

      const recognition = new SR()
      recognitionRef.current = recognition

      // Mobile Chrome often lacks bn-BD → use bn-IN which still recognizes Bangla
      const primaryLang =
        lang === 'bn-BD'
          ? triedFallbackLang.current
            ? 'bn-IN'
            : 'bn-BD'
          : lang
      recognition.lang = primaryLang
      recognition.interimResults = true
      recognition.continuous = false
      recognition.maxAlternatives = 5

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setTranscript('')
        setInterimTranscript('')
        setConfidence(0)
      }

      recognition.onresult = (event) => {
        let interim = ''
        let finalText = ''
        let bestConf = 0

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const alts: string[] = []
          for (let j = 0; j < result.length; j++) {
            if (result[j]?.transcript) alts.push(result[j].transcript)
          }
          const alt = result[0]
          if (!alt) continue
          if (result.isFinal) {
            finalText += alts.join(' ') || alt.transcript
            bestConf = Math.max(bestConf, alt.confidence || 0)
          } else {
            interim += alt.transcript
          }
        }

        if (interim) setInterimTranscript(interim.trim())
        if (finalText) {
          setTranscript(finalText.trim())
          setInterimTranscript('')
          setConfidence(bestConf)
        }
      }

      recognition.onerror = (event) => {
        const code = event.error
        if (
          (code === 'language-not-supported' || code === 'service-not-allowed') &&
          lang === 'bn-BD' &&
          !triedFallbackLang.current
        ) {
          triedFallbackLang.current = true
          setTimeout(() => startListening('bn-BD'), 200)
          return
        }
        const messages: Record<string, string> = {
          'not-allowed': 'মাইক অনুমতি দাও (browser permission)',
          'no-speech': 'কিছু শোনা যায়নি — জোরে আবার বলো',
          aborted: 'বন্ধ করা হয়েছে',
          network: 'নেটওয়ার্ক সমস্যা — আবার চেষ্টা করো',
          'audio-capture': 'মাইক পাওয়া যায়নি',
          'language-not-supported': 'এই ভাষা সাপোর্ট করে না — Chrome ব্যবহার করো',
        }
        setError(messages[code] || code)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        recognitionRef.current = null
      }

      try {
        recognition.start()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'শুরু করা যায়নি')
        setIsListening(false)
      }
    },
    [supported],
  )

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    setConfidence(0)
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    supported,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
  }
}

function normalizeBn(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s\u200c\u200d.,!?;:'"।॥]+/g, '')
    .replace(/়/g, '')
}

/** Fuzzy match student speech vs expected letter/word. */
export function matchSpokenToExpected(spoken: string, expected: string): boolean {
  const a = normalizeBn(spoken)
  const b = normalizeBn(expected)
  if (!a || !b) return false
  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true

  if (b.length <= 2 && a.includes(b[0])) return true

  const aliases = BN_ALIASES[expected.trim()] || BN_ALIASES[b]
  if (aliases) {
    for (const al of aliases) {
      const n = normalizeBn(al)
      if (n && (a === n || a.includes(n) || n.includes(a))) return true
    }
  }

  for (const [key, vals] of Object.entries(BN_ALIASES)) {
    if (normalizeBn(key) === b || vals.some((v) => normalizeBn(v) === b)) {
      for (const v of [key, ...vals]) {
        const n = normalizeBn(v)
        if (n && a.includes(n)) return true
      }
    }
  }

  return false
}
