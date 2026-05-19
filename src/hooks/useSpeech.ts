import { useCallback, useState } from 'react'

const BANGLA_PRONUNCIATION: Record<string, string> = {
    'অ': 'অ দিয়ে অজগর', 'আ': 'আ দিয়ে আম', 'ই': 'ই দিয়ে ইলিশ',
    'ঈ': 'ঈ দিয়ে ঈগল', 'উ': 'উ দিয়ে উট', 'ঊ': 'ঊ দিয়ে ঊষা',
    'ঋ': 'ঋ দিয়ে ঋষি', 'এ': 'এ দিয়ে একতারা', 'ঐ': 'ঐ দিয়ে ঐরাবত',
    'ও': 'ও দিয়ে ওল', 'ঔ': 'ঔ দিয়ে ঔষধ',
    'ক': 'ক দিয়ে কলা', 'খ': 'খ দিয়ে খরগোশ', 'গ': 'গ দিয়ে গরু',
    'ঘ': 'ঘ দিয়ে ঘড়ি', 'চ': 'চ দিয়ে চাঁদ', 'ছ': 'ছ দিয়ে ছাগল',
    'জ': 'জ দিয়ে জাম', 'ঝ': 'ঝ দিয়ে ঝড়', 'ট': 'ট দিয়ে টমেটো',
    'ড': 'ড দিয়ে ডাব', 'ণ': 'ণ দিয়ে মণি', 'ত': 'ত দিয়ে তরমুজ',
    'দ': 'দ দিয়ে দাঁত', 'ন': 'ন দিয়ে নৌকা', 'প': 'প দিয়ে পাখি',
    'ফ': 'ফ দিয়ে ফুল', 'ব': 'ব দিয়ে বাঘ', 'ভ': 'ভ দিয়ে ভালুক',
    'ম': 'ম দিয়ে মাছ', 'য': 'য দিয়ে যাত্রী', 'র': 'র দিয়ে রকেট',
    'ল': 'ল দিয়ে লাল', 'শ': 'শ দিয়ে শাপলা', 'স': 'স দিয়ে সাপ',
    'হ': 'হ দিয়ে হাতি',
    '১': 'এক', '২': 'দুই', '৩': 'তিন', '৪': 'চার', '৫': 'পাঁচ',
    '৬': 'ছয়', '৭': 'সাত', '৮': 'আট', '৯': 'নয়', '১০': 'দশ',
    'এক': 'এক', 'দুই': 'দুই', 'তিন': 'তিন', 'চার': 'চার', 'পাঁচ': 'পাঁচ',
    'ছয়': 'ছয়', 'সাত': 'সাত', 'আট': 'আট', 'নয়': 'নয়', 'দশ': 'দশ',
    'এগারো': 'এগারো', 'বারো': 'বারো', 'তেরো': 'তেরো', 'চৌদ্দ': 'চৌদ্দ',
    'পনেরো': 'পনেরো', 'ষোলো': 'ষোলো', 'সতেরো': 'সতেরো', 'আঠারো': 'আঠারো',
    'উনিশ': 'উনিশ', 'বিশ': 'বিশ', 'ত্রিশ': 'ত্রিশ', 'চল্লিশ': 'চল্লিশ',
    'পঞ্চাশ': 'পঞ্চাশ',
    '১১': 'এগারো', '১২': 'বারো', '১৩': 'তেরো', '১৪': 'চৌদ্দ',
    '১৫': 'পনেরো', '২০': 'বিশ', '৩০': 'ত্রিশ', '৪০': 'চল্লিশ', '৫০': 'পঞ্চাশ',
    '১+১': 'এক যোগ এক সমান দুই',
    '২+২': 'দুই যোগ দুই সমান চার',
    '৩+৩': 'তিন যোগ তিন সমান ছয়',
    '৪+৪': 'চার যোগ চার সমান আট',
    '৫+৫': 'পাঁচ যোগ পাঁচ সমান দশ',
    '৫-১': 'পাঁচ বিয়োগ এক সমান চার',
    '৬-২': 'ছয় বিয়োগ দুই সমান চার',
    '৮-৩': 'আট বিয়োগ তিন সমান পাঁচ',
    '১০-৫': 'দশ বিয়োগ পাঁচ সমান পাঁচ',
}

const ARABIC_PRONUNCIATION: Record<string, string> = {
    'ا': 'আলিফ', 'ب': 'বা', 'ت': 'তা', 'ث': 'ছা',
    'ج': 'জীম', 'ح': 'হা', 'خ': 'খা', 'د': 'দাল',
    'ذ': 'যাল', 'ر': 'রা', 'ز': 'যা', 'س': 'সিন',
    'ش': 'শিন', 'ص': 'সদ', 'ض': 'দদ', 'ط': 'ত্বা',
    'ظ': 'য্বা', 'ع': 'আইন', 'غ': 'গাইন', 'ف': 'ফা',
    'ق': 'ক্বফ', 'ك': 'কাফ', 'ل': 'লাম', 'م': 'মীম',
    'ن': 'নুন', 'ه': 'হা', 'و': 'ওয়াও', 'ي': 'ইয়া',
}


export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const speak = useCallback((
        text: string,
        lang: 'bn-BD' | 'en-US' | 'ar-SA' = 'bn-BD'
    ) => {
        if (typeof window === 'undefined') return

        // Text pronunciation map
        let speakText = text
        if (lang === 'bn-BD') {
            speakText = BANGLA_PRONUNCIATION[text] || text
        } else if (lang === 'ar-SA') {
            speakText = ARABIC_PRONUNCIATION[text] || text
        }

        // English — browser TTS (সবসময় কাজ করে)
        if (lang === 'en-US') {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(speakText)
            utterance.lang = 'en-US'
            utterance.rate = 0.8
            utterance.pitch = 1.1
            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            window.speechSynthesis.speak(utterance)
            return
        }

        // বাংলা ও Arabic — API route দিয়ে Google TTS
        const ttsLang = lang === 'bn-BD' ? 'bn' : (lang === 'ar-SA' ? 'bn' : 'bn')
        const apiUrl = `/api/tts?text=${encodeURIComponent(speakText)}&lang=${ttsLang}`

        setIsLoading(true)
        setIsSpeaking(true)

        const audio = new Audio(apiUrl)

        audio.oncanplaythrough = () => {
            setIsLoading(false)
            audio.play().catch(() => {
                setIsSpeaking(false)
                setIsLoading(false)
            })
        }

        audio.onended = () => setIsSpeaking(false)
        audio.onerror = () => {
            setIsSpeaking(false)
            setIsLoading(false)
        }

        audio.load()
    }, [])

    const stop = useCallback(() => {
        if (typeof window === 'undefined') return
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }, [])

    return { speak, stop, isSpeaking, isLoading }
}

