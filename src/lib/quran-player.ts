/** Client-side Quran audio player — sequential ayahs + clear streaming status */

import { buildAyahAudioUrls } from '@/lib/quran-audio'

export type AudioStatus =
  | { phase: 'idle' }
  | { phase: 'loading'; ayah?: number; total?: number; message: string }
  | { phase: 'playing'; ayah?: number; total?: number; message: string }
  | { phase: 'error'; message: string }

export type PlayController = {
  stop: () => void
}

const LOAD_TIMEOUT_MS = 18000

function playUrl(
  url: string,
  signal: { stopped: boolean; current?: HTMLAudioElement },
  onPlaying?: () => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.stopped) {
      reject(new Error('stopped'))
      return
    }

    const audio = new Audio()
    audio.preload = 'auto'

    let settled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const cleanup = () => {
      if (timer) clearTimeout(timer)
      audio.oncanplay = null
      audio.onplaying = null
      audio.onended = null
      audio.onerror = null
      audio.onabort = null
    }

    const fail = (reason: string) => {
      if (settled) return
      settled = true
      cleanup()
      try {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      } catch {
        /* ignore */
      }
      reject(new Error(reason))
    }

    const succeedEnded = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve()
    }

    timer = setTimeout(() => fail('timeout'), LOAD_TIMEOUT_MS)

    audio.onerror = () => fail('load failed')
    audio.onabort = () => fail('aborted')
    audio.onended = () => succeedEnded()
    audio.onplaying = () => {
      onPlaying?.()
    }

    audio.oncanplay = () => {
      if (signal.stopped) {
        fail('stopped')
        return
      }
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.catch(() => fail('play blocked'))
      }
    }

    signal.current = audio

    try {
      audio.src = url
      audio.load()
    } catch {
      fail('src failed')
    }
  })
}

async function playFirstWorking(
  urls: string[],
  signal: { stopped: boolean; current?: HTMLAudioElement },
  onTry?: (url: string, index: number) => void,
  onPlaying?: () => void,
): Promise<void> {
  let last: unknown
  for (let i = 0; i < urls.length; i++) {
    if (signal.stopped) throw new Error('stopped')
    const url = urls[i]
    onTry?.(url, i)
    try {
      await playUrl(url, signal, onPlaying)
      return
    } catch (e) {
      last = e
      if (signal.stopped) throw e
      signal.current = undefined
    }
  }
  throw last || new Error('all urls failed')
}

/**
 * Play a single ayah with fallback URLs.
 */
export function playAyahAudio(
  qariId: string,
  surah: number,
  ayah: number,
  onStatus?: (s: AudioStatus) => void,
): PlayController {
  const signal: { stopped: boolean; current?: HTMLAudioElement } = { stopped: false }

  const stop = () => {
    signal.stopped = true
    if (signal.current) {
      try {
        signal.current.pause()
        signal.current.removeAttribute('src')
        signal.current.load()
      } catch {
        /* ignore */
      }
      signal.current = undefined
    }
    onStatus?.({ phase: 'idle' })
  }

  void (async () => {
    onStatus?.({
      phase: 'loading',
      ayah,
      message: '⬇️ অডিও লোড হচ্ছে… ওয়েব থেকে স্ট্রিম শুরু',
    })
    const urls = buildAyahAudioUrls(qariId, surah, ayah)
    try {
      await playFirstWorking(
        urls,
        signal,
        (_url, index) => {
          const via = index === 0 ? 'সার্ভার প্রক্সি' : 'সরাসরি CDN'
          onStatus?.({
            phase: 'loading',
            ayah,
            message: `⬇️ ${via} থেকে লোড… আয়াত ${ayah}`,
          })
        },
        () => {
          onStatus?.({
            phase: 'playing',
            ayah,
            message: `▶️ আয়াত ${ayah} চলছে…`,
          })
        },
      )
      if (!signal.stopped) onStatus?.({ phase: 'idle' })
    } catch {
      if (!signal.stopped) {
        onStatus?.({
          phase: 'error',
          message: 'অডিও লোড হয়নি। অন্য ক্বারী চেষ্টা করো বা নেট চেক করো।',
        })
      }
    }
  })()

  return { stop }
}

/**
 * Play full surah ayah-by-ayah with streaming status.
 */
export function playSurahAudio(
  qariId: string,
  surah: number,
  ayahCount: number,
  onStatus?: (s: AudioStatus) => void,
): PlayController {
  const signal: { stopped: boolean; current?: HTMLAudioElement } = { stopped: false }

  const stop = () => {
    signal.stopped = true
    if (signal.current) {
      try {
        signal.current.pause()
        signal.current.removeAttribute('src')
        signal.current.load()
      } catch {
        /* ignore */
      }
      signal.current = undefined
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
          message: `⬇️ আয়াত ${a}/${ayahCount} — ওয়েব থেকে স্ট্রিম লোড হচ্ছে…`,
        })

        const urls = buildAyahAudioUrls(qariId, surah, a)

        try {
          await playFirstWorking(
            urls,
            signal,
            (_url, index) => {
              const via = index === 0 ? 'প্রক্সি (auto stream)' : 'ডাইরেক্ট CDN'
              onStatus?.({
                phase: 'loading',
                ayah: a,
                total: ayahCount,
                message: `⬇️ ${via} · আয়াত ${a}/${ayahCount}`,
              })
            },
            () => {
              onStatus?.({
                phase: 'playing',
                ayah: a,
                total: ayahCount,
                message: `▶️ তিলাওয়াত চলছে · আয়াত ${a}/${ayahCount}`,
              })
            },
          )
        } catch {
          if (signal.stopped) return
          onStatus?.({
            phase: 'error',
            message: `আয়াত ${a} লোড হয়নি। অন্য ক্বারী বা নেট চেষ্টা করো।`,
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
