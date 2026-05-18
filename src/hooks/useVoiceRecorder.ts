import { useState, useRef, useCallback } from 'react'

type RecordingState = 'idle' | 'recording' | 'processing' | 'correct' | 'wrong'

export function useVoiceRecorder() {
    const [state, setState] = useState<RecordingState>('idle')
    const [transcript, setTranscript] = useState('')
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const checkPronunciation = useCallback(async (
        expected: string,
        lang: string
    ): Promise<boolean> => {
        return new Promise(async (resolve) => {
            try {
                // Mic permission
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                setState('recording')
                chunksRef.current = []

                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
                })
                mediaRecorderRef.current = mediaRecorder

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data)
                }

                mediaRecorder.onstop = async () => {
                    setState('processing')
                    stream.getTracks().forEach(t => t.stop())

                    const audioBlob = new Blob(chunksRef.current, {
                        type: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
                    })

                    const formData = new FormData()
                    formData.append('audio', audioBlob, 'recording.webm')
                    formData.append('expected', expected)
                    formData.append('lang', lang)

                    try {
                        const response = await fetch('/api/pronunciation-check', {
                            method: 'POST',
                            body: formData,
                        })
                        const data = await response.json()
                        setTranscript(data.transcript || '')
                        setState(data.isCorrect ? 'correct' : 'wrong')
                        resolve(data.isCorrect)
                    } catch {
                        setState('wrong')
                        resolve(false)
                    }
                }

                // ৩ সেকেন্ড record করো
                mediaRecorder.start()
                setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop()
                    }
                }, 3000)

            } catch {
                setState('wrong')
                resolve(false)
            }
        })
    }, [])

    const reset = useCallback(() => {
        setState('idle')
        setTranscript('')
    }, [])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
    }, [])

    return { state, transcript, checkPronunciation, reset, stopRecording }
}