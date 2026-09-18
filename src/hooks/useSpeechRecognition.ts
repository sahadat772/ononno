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

/**
 * Web Speech API — SpeechRecognition (webkit for Chrome/Safari).
 */
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
  const recognitionRef = useRef<{ stop: () => void; abort?: () => void } | null>(
    null,
  )

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
        setError('মাইক / Speech Recognition এই ব্রাউজারে নেই')
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

      recognition.lang = lang
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
          const alt = result[0]
          if (!alt) continue
          if (result.isFinal) {
            finalText += alt.transcript
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
        const messages: Record<string, string> = {
          'not-allowed': 'মাইক অনুমতি দাও (browser permission)',
          'no-speech': 'কিছু শোনা যায়নি — আবার বলো',
          aborted: 'বন্ধ করা হয়েছে',
          network: 'নেটওয়ার্ক সমস্যা',
          'audio-capture': 'মাইক পাওয়া যায়নি',
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

/** Fuzzy match student speech vs expected letter/word. */
export function matchSpokenToExpected(
  spoken: string,
  expected: string,
): boolean {
  const a = spoken.trim().toLowerCase().replace(/\s+/g, '')
  const b = expected.trim().toLowerCase().replace(/\s+/g, '')
  if (!a || !b) return false
  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true
  if (b.length <= 2 && a.includes(b[0])) return true
  return false
}
