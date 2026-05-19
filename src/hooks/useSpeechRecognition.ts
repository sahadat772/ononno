import { useState, useCallback, useMemo } from 'react'

interface SpeechRecognitionHook {
    isListening: boolean
    transcript: string
    error: string | null
    supported: boolean
    startListening: (lang?: 'bn-BD' | 'en-US' | 'ar-SA') => void
    stopListening: () => void
    resetTranscript: () => void
}

export function useSpeechRecognition(): SpeechRecognitionHook {
    const supported = useMemo(() => {
        if (typeof window === 'undefined') return false
        return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    }, [])

    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)

    const startListening = useCallback((lang: 'bn-BD' | 'en-US' | 'ar-SA' = 'bn-BD') => {
        if (!supported) {
            setError('Speech recognition supported নয়')
            return
        }

        type SRType = new () => {
            lang: string
            interimResults: boolean
            continuous: boolean
            maxAlternatives: number
            onstart: (() => void) | null
            onresult: ((e: { resultIndex: number; results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null
            onerror: ((e: { error: string }) => void) | null
            onend: (() => void) | null
            start: () => void
            stop: () => void
        }

        const w = window as Window & {
            SpeechRecognition?: SRType
            webkitSpeechRecognition?: SRType
        }

        const SR = w.SpeechRecognition || w.webkitSpeechRecognition
        if (!SR) return

        const recognition = new SR()
        recognition.lang = lang
        recognition.interimResults = true
        recognition.continuous = false
        recognition.maxAlternatives = 3

        recognition.onstart = () => {
            setIsListening(true)
            setError(null)
            setTranscript('')
        }

        recognition.onresult = (event: { resultIndex: number; results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
            const current = event.resultIndex
            const result = event.results[current]
            const text = result[0].transcript
            setTranscript(text)
        }

        recognition.onerror = (event: { error: string }) => {
            setError(event.error)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }, [supported])

    const stopListening = useCallback(() => {
        setIsListening(false)
    }, [])

    const resetTranscript = useCallback(() => {
        setTranscript('')
        setError(null)
    }, [])

    return {
        isListening,
        transcript,
        error,
        supported,
        startListening,
        stopListening,
        resetTranscript,
    }
}