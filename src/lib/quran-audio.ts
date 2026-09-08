/** Quran audio helpers — everyayah + same-origin proxy */
export const QARI_FOLDER: Record<string, string> = {
  'ar.alafasy': 'Alafasy_128kbps',
  'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
  'ar.husary': 'Husary_128kbps',
  'ar.minshawi': 'Minshawy_Murattal_128kbps',
  'ar.muhammadayyoub': 'Muhammad_Ayyoub_128kbps',
};

export function buildAyahAudioUrls(
  qariId: string,
  surahNumber: number,
  ayahNumber: number,
): string[] {
  const folder = QARI_FOLDER[qariId] || 'Alafasy_128kbps';
  const code =
    String(surahNumber).padStart(3, '0') + String(ayahNumber).padStart(3, '0');
  return [
    // Same-origin proxy first (streaming, no CORS)
    `/api/islamic/audio?qari=${encodeURIComponent(folder)}&surah=${surahNumber}&ayah=${ayahNumber}`,
    // Direct everyayah CDN
    `https://everyayah.com/data/${folder}/${code}.mp3`,
    // Alafasy fallback if other qari missing
    `https://everyayah.com/data/Alafasy_128kbps/${code}.mp3`,
    // verses.quran.com
    `https://verses.quran.com/Alafasy/mp3/${code}.mp3`,
  ];
}
