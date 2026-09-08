import { useCallback, useRef, useState } from 'react'

const BANGLA_PRONUNCIATION: Record<string, string> = {
  অ: 'অ দিয়ে অজগর',
  আ: 'আ দিয়ে আম',
  ই: 'ই দিয়ে ইলিশ',
  ঈ: 'ঈ দিয়ে ঈগল',
  উ: 'উ দিয়ে উট',
  ঊ: 'ঊ দিয়ে ঊষা',
  ঋ: 'ঋ দিয়ে ঋষি',
  এ: 'এ দিয়ে একতারা',
  ঐ: 'ঐ দিয়ে ঐরাবত',
  ও: 'ও দিয়ে ওল',
  ঔ: 'ঔ দিয়ে ঔষধ',
  ক: 'ক দিয়ে কলা',
  খ: 'খ দিয়ে খরগোশ',
  গ: 'গ দিয়ে গরু',
  ঘ: 'ঘ দিয়ে ঘড়ি',
  চ: 'চ দিয়ে চাঁদ',
  ছ: 'ছ দিয়ে ছাগল',
  জ: 'জ দিয়ে জাম',
  ঝ: 'ঝ দিয়ে ঝড়',
  ট: 'ট দিয়ে টমেটো',
  ড: 'ড দিয়ে ডাব',
  ণ: 'ণ দিয়ে মণি',
  ত: 'ত দিয়ে তরমুজ',
  দ: 'দ দিয়ে দাঁত',
  ন: 'ন দিয়ে নৌকা',
  প: 'প দিয়ে পাখি',
  ফ: 'ফ দিয়ে ফুল',
  ব: 'ব দিয়ে বাঘ',
  ভ: 'ভ দিয়ে ভালুক',
  ম: 'ম দিয়ে মাছ',
  য: 'য দিয়ে যাত্রী',
  র: 'র দিয়ে রকেট',
  ল: 'ল দিয়ে লাল',
  শ: 'শ দিয়ে শাপলা',
  স: 'স দিয়ে সাপ',
  হ: 'হ দিয়ে হাতি',
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

export type SpeechStatus =
  | { phase: 'idle' }
  | { phase: 'loading'; message: string }
  | { phase: 'playing'; message: string }
  | { phase: 'error'; message: string }

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<SpeechStatus>({ phase: 'idle' })
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

  const speak = useCallback(
    (text: string, lang: 'bn-BD' | 'en-US' | 'ar-SA' = 'bn-BD') => {
      if (typeof window === 'undefined' || !text?.trim()) return

      stop()

      let speakText = text.trim()
      if (lang === 'bn-BD' && BANGLA_PRONUNCIATION[speakText]) {
        speakText = BANGLA_PRONUNCIATION[speakText]
      } else if (lang === 'ar-SA' && speakText.length === 1 && ARABIC_LETTER_NAME[speakText]) {
        speakText = speakText
      }

      if (lang === 'en-US') {
        const utterance = new SpeechSynthesisUtterance(speakText)
        utterance.lang = 'en-US'
        utterance.rate = 0.85
        utterance.pitch = 1.05
        utterance.onstart = () => {
          setIsSpeaking(true)
          setStatus({ phase: 'playing', message: 'শুনছো…' })
        }
        utterance.onend = () => {
          setIsSpeaking(false)
          setStatus({ phase: 'idle' })
        }
        utterance.onerror = () => {
          setIsSpeaking(false)
          setStatus({ phase: 'error', message: 'অডিও চালানো যায়নি' })
        }
        window.speechSynthesis.speak(utterance)
        return
      }

      const ttsLang = lang === 'ar-SA' ? 'ar' : 'bn'
      const apiUrl = `/api/tts?text=${encodeURIComponent(speakText)}&lang=${ttsLang}`

      setIsLoading(true)
      setIsSpeaking(true)
      setStatus({
        phase: 'loading',
        message:
          ttsLang === 'ar'
            ? '⬇️ আরবি অডিও লোড হচ্ছে… ওয়েব থেকে স্ট্রিম'
            : '⬇️ বাংলা অডিও লোড হচ্ছে…',
      })

      const audio = new Audio()
      audioRef.current = audio
      audio.preload = 'auto'

      const onFail = () => {
        setIsSpeaking(false)
        setIsLoading(false)
        setStatus({ phase: 'error', message: 'অডিও লোড হয়নি। আবার চেষ্টা করো।' })
        audioRef.current = null
      }

      audio.addEventListener('canplaythrough', () => {
        setIsLoading(false)
        setStatus({
          phase: 'playing',
          message: ttsLang === 'ar' ? '▶️ আরবি তিলাওয়াত চলছে' : '▶️ বাংলা উচ্চারণ চলছে',
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
    },
    [stop],
  )

  return { speak, stop, isSpeaking, isLoading, status }
}
