/** Client-side Quran audio player — sequential ayahs + status callbacks */

import { buildAyahAudioUrls } from '@/lib/quran-audio'

export type AudioStatus =
  | { phase: 'idle' }
  | { phase: 'loading'; ayah?: number; total?: number; message: string }
  | { phase: 'playing'; ayah?: number; total?: number; message: string }
  | { phase: 'error'; message: string }

export type PlayController = {
  stop: () => void
}

function playOneUrl(url: string, signal: { stopped: boolean }): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    if (signal.stopped) {
      reject(new Error('stopped'))
      return
    }
    const audio = new Audio()
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'

    const onError = () => {
      cleanup()
      reject(new Error('load failed'))
    }
    const onEnded = () => {
      cleanup()
      resolve(audio)
    }
    const cleanup = () => {
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)
    }

    audio.addEventListener('error', onError)
    audio.addEventListener('ended', onEnded)
    audio.src = url

    const p = audio.play()
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        cleanup()
        reject(new Error('play blocked'))
      })
    }
  })
}

async function playFirstWorking(
  urls: string[],
  signal: { stopped: boolean },
  onTry?: (url: string) => void,
): Promise<void> {
  let last: unknown
  for (const url of urls) {
    if (signal.stopped) throw new Error('stopped')
    onTry?.(url)
    try {
      await playOneUrl(url, signal)
      return
    } catch (e) {
      last = e
      if (signal.stopped) throw e
    }
  }
  throw last || new Error('all urls failed')
}

/**
 * Play a single ayah with fallback URLs.
 * Returns a controller to stop.
 */
export function playAyahAudio(
  qariId: string,
  surah: number,
  ayah: number,
  onStatus?: (s: AudioStatus) => void,
): PlayController {
  const signal = { stopped: false }
  let current: HTMLAudioElement | null = null

  const stop = () => {
    signal.stopped = true
    if (current) {
      try {
        current.pause()
        current.src = ''
      } catch {
        /* ignore */
      }
      current = null
    }
    onStatus?.({ phase: 'idle' })
  }

  void (async () => {
    onStatus?.({
      phase: 'loading',
      ayah,
      message: 'অডিও লোড হচ্ছে… স্ট্রিমিং শুরু হচ্ছে',
    })
    const urls = buildAyahAudioUrls(qariId, surah, ayah)
    try {
      // Use internal play that keeps ref
      for (const url of urls) {
        if (signal.stopped) return
        try {
          await new Promise<void>((resolve, reject) => {
            if (signal.stopped) {
              reject(new Error('stopped'))
              return
            }
            const audio = new Audio()
            current = audio
            audio.preload = 'auto'
            const fail = () => reject(new Error('fail'))
            audio.addEventListener('error', fail)
            audio.addEventListener('ended', () => resolve())
            audio.addEventListener('playing', () => {
              onStatus?.({
                phase: 'playing',
                ayah,
                message: `আয়াত ${ayah} চলছে…`,
              })
            })
            audio.src = url
            const p = audio.play()
            if (p) p.catch(fail)
          })
          onStatus?.({ phase: 'idle' })
          return
        } catch {
          current = null
        }
      }
      if (!signal.stopped) {
        onStatus?.({
          phase: 'error',
          message: 'অডিও লোড হয়নি। অন্য ক্বারী চেষ্টা করো।',
        })
      }
    } catch {
      if (!signal.stopped) {
        onStatus?.({ phase: 'error', message: 'অডিও চালানো যায়নি।' })
      }
    }
  })()

  return { stop }
}

/**
 * Play full surah ayah-by-ayah.
 */
export function playSurahAudio(
  qariId: string,
  surah: number,
  ayahCount: number,
  onStatus?: (s: AudioStatus) => void,
): PlayController {
  const signal = { stopped: false }
  let current: HTMLAudioElement | null = null

  const stop = () => {
    signal.stopped = true
    if (current) {
      try {
        current.pause()
        current.src = ''
      } catch {
        /* ignore */
      }
      current = null
    }
    onStatus?.({ phase: 'idle' })
  }

  void (async () => {
    try {
      for (let a = 1; a <= ayahCount; a++) {
        if (signal.stopped) return
        onStatus?.({
          phase: 'loading',
          ayah: a,
          total: ayahCount,
          message: `আয়াত ${a}/${ayahCount} লোড হচ্ছে…`,
        })

        const urls = buildAyahAudioUrls(qariId, surah, a)
        let played = false

        for (const url of urls) {
          if (signal.stopped) return
          try {
            await new Promise<void>((resolve, reject) => {
              if (signal.stopped) {
                reject(new Error('stopped'))
                return
              }
              const audio = new Audio()
              current = audio
              audio.preload = 'auto'
              const fail = () => {
                audio.removeEventListener('error', fail)
                reject(new Error('fail'))
              }
              audio.addEventListener('error', fail)
              audio.addEventListener('playing', () => {
                onStatus?.({
                  phase: 'playing',
                  ayah: a,
                  total: ayahCount,
                  message: `তিলাওয়াত চলছে · আয়াত ${a}/${ayahCount}`,
                })
              })
              audio.addEventListener('ended', () => {
                audio.removeEventListener('error', fail)
                resolve()
              })
              audio.src = url
              const p = audio.play()
              if (p) p.catch(fail)
            })
            played = true
            break
          } catch {
            current = null
          }
        }

        if (!played && !signal.stopped) {
          onStatus?.({
            phase: 'error',
            message: `আয়াত ${a} লোড হয়নি। অন্য ক্বারী চেষ্টা করো।`,
          })
          return
        }
      }
      if (!signal.stopped) onStatus?.({ phase: 'idle' })
    } catch {
      if (!signal.stopped) {
        onStatus?.({ phase: 'error', message: 'অডিও চালানো যায়নি।' })
      }
    }
  })()

  return { stop }
}

export { playFirstWorking }
