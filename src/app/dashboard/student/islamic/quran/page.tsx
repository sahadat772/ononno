'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AnalysisPanel from '@/components/ui/AnalysisPanel'
import type { AnalysisResult } from '@/lib/groq'

interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

interface AyahWithTranslation {
    number: number;
    numberInSurah: number;
    text: string;
    translation: string;
    transliteration: string;
}

const qaris = [
    {
        id: 'ar.alafasy',
        name: 'মিশারি আল-আফাসি',
        arabic: 'مشاري العفاسي',
        country: '🇰🇼 কুয়েত',
        style: 'মুরাত্তাল',
    },
    {
        id: 'ar.abdurrahmaansudais',
        name: 'আব্দুর রহমান আস-সুদাইস',
        arabic: 'عبدالرحمن السديس',
        country: '🇸🇦 সৌদি আরব',
        style: 'মুরাত্তাল',
    },
    {
        id: 'ar.husary',
        name: 'মাহমুদ খলিল আল-হুসারি',
        arabic: 'محمود خليل الحصري',
        country: '🇪🇬 মিশর',
        style: 'মুরাত্তাল',
    },
    {
        id: 'ar.minshawi',
        name: 'মুহাম্মদ সিদ্দিক আল-মিনশাউই',
        arabic: 'محمد صديق المنشاوي',
        country: '🇪🇬 মিশর',
        style: 'মুজাওয়াদ',
    },
    {
        id: 'ar.muhammadayyoub',
        name: 'মুহাম্মদ আইয়ুব',
        arabic: 'محمد أيوب',
        country: '🇸🇦 সৌদি আরব',
        style: 'মুরাত্তাল',
    },
];

// Transliteration map for common Arabic letters (simplified)
const transliterationMap: Record<number, string[]> = {
    1: [
        'বিসমিল্লাহির রাহমানির রাহিম',
        'আলহামদুলিল্লাহি রাব্বিল আলামিন',
        'আর রাহমানির রাহিম',
        'মালিকি ইয়াউমিদ্দিন',
        'ইয়্যাকা না\'বুদু ওয়া ইয়্যাকা নাসতাঈন',
        'ইহদিনাস সিরাতাল মুস্তাকিম',
        'সিরাতাল্লাজিনা আন\'আমতা আলাইহিম গাইরিল মাগদুবি আলাইহিম ওয়ালাদ দ্বাল্লিন',
    ],
    112: [
        'কুল হুওয়াল্লাহু আহাদ',
        'আল্লাহুস সামাদ',
        'লাম ইয়ালিদ ওয়া লাম ইউলাদ',
        'ওয়া লাম ইয়াকুল্লাহু কুফুওয়ান আহাদ',
    ],
    113: [
        'কুল আউজু বিরাব্বিল ফালাক',
        'মিন শাররি মা খালাক',
        'ওয়া মিন শাররি গাসিকিন ইজা ওয়াকাব',
        'ওয়া মিন শাররিন নাফফাসাতি ফিল উকাদ',
        'ওয়া মিন শাররি হাসিদিন ইজা হাসাদ',
    ],
    114: [
        'কুল আউজু বিরাব্বিন নাস',
        'মালিকিন নাস',
        'ইলাহিন নাস',
        'মিন শাররিল ওয়াসওয়াসিল খান্নাস',
        'আল্লাজি ইউওয়াসউইসু ফি সুদুরিন নাস',
        'মিনাল জিন্নাতি ওয়ান নাস',
    ],
    108: [
        'ইন্না আ\'তাইনাকাল কাউসার',
        'ফাসাল্লি লিরাব্বিকা ওয়ানহার',
        'ইন্না শানিআকা হুওয়াল আবতার',
    ],
    110: [
        'ইজা জাআ নাসরুল্লাহি ওয়াল ফাতহ',
        'ওয়া রাআইতান নাসা ইয়াদখুলুনা ফি দিনিল্লাহি আফওয়াজা',
        'ফাসাব্বিহ বিহামদি রাব্বিকা ওয়াস্তাগফিরহু ইন্নাহু কানা তাওয়াবা',
    ],
};

export default function QuranPage() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
    const [loadingSurahs, setLoadingSurahs] = useState(true);
    const [loadingAyahs, setLoadingAyahs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedAyah, setExpandedAyah] = useState<number | null>(null);
    const [selectedQari, setSelectedQari] = useState(qaris[0]);
    const [showQariSelector, setShowQariSelector] = useState(false);
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const res = await fetch('https://api.alquran.cloud/v1/surah');
                const data = await res.json();
                if (data.code === 200) setSurahs(data.data);
            } catch {
                setError('সূরা তালিকা লোড হয়নি। ইন্টারনেট চেক করুন।');
            } finally {
                setLoadingSurahs(false);
            }
        };
        fetchSurahs();
    }, []);

    const fetchAyahs = async (surah: Surah) => {
        setSelectedSurah(surah);
        setLoadingAyahs(true);
        setAyahs([]);
        setExpandedAyah(null);
        stopAudio();

        try {
            const [arabicRes, banglaRes] = await Promise.all([
                fetch(`https://api.alquran.cloud/v1/surah/${surah.number}`),
                fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/bn.bengali`),
            ]);

            const arabicData = await arabicRes.json();
            const banglaData = await banglaRes.json();

            if (arabicData.code === 200 && banglaData.code === 200) {
                const translit = transliterationMap[surah.number] || [];
                const combined: AyahWithTranslation[] = arabicData.data.ayahs.map(
                    (ayah: { number: number; numberInSurah: number; text: string }, index: number) => ({
                        ...ayah,
                        translation: banglaData.data.ayahs[index]?.text || '',
                        transliteration: translit[index] || '',
                    })
                );
                setAyahs(combined);
            }
        } catch {
            setError('আয়াত লোড হয়নি। আবার চেষ্টা করুন।');
        } finally {
            setLoadingAyahs(false);
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setPlayingAyah(null);
    };

    const playAyah = (surahNumber: number, ayahNumber: number) => {
        // Stop current
        stopAudio();

        if (playingAyah === ayahNumber) return;

        // CDN URL format for each qari
        const surahPadded = String(surahNumber).padStart(3, '0');
        const ayahPadded = String(ayahNumber).padStart(3, '0');

        // everyayah.com CDN — free, reliable
        const audioUrl = `https://cdn.islamic.network/quran/audio/${selectedQari.id}/${surahPadded}${ayahPadded}.mp3`;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setPlayingAyah(ayahNumber);

        audio.play().catch(() => {
            // fallback to alquran.cloud audio
            const fallbackUrl = `https://cdn.alquran.cloud/media/audio/ayah/${selectedQari.id}/${(surahNumber - 1) * 1000 + ayahNumber
                }`;
            const fallbackAudio = new Audio(fallbackUrl);
            audioRef.current = fallbackAudio;
            fallbackAudio.play().catch(() => setError('অডিও লোড হয়নি।'));
            fallbackAudio.onended = () => setPlayingAyah(null);
        });

        audio.onended = () => setPlayingAyah(null);
    };

    const filteredSurahs = surahs.filter(s =>
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.number.toString().includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link
                    href="/dashboard/student/islamic"
                    className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-flex items-center gap-2 transition-colors"
                >
                    ← ইসলামিক স্টাডিতে ফিরে যাও
                </Link>

                <div className="flex items-center gap-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
                        📖
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            কুরআন শরীফ
                        </h1>
                        <p className="text-gray-400 mt-1">১১৪টি সূরা • আরবি • বাংলা • উচ্চারণ • তিলাওয়াত</p>
                    </div>
                </div>
            </motion.div>

            {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm flex items-center justify-between">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
                </div>
            )}

            {/* Surah List */}
            {!selectedSurah && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <input
                            type="text"
                            placeholder="সূরা খুঁজুন... (নাম বা নম্বর)"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </motion.div>

                    {loadingSurahs && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-4 animate-pulse h-20" />
                            ))}
                        </div>
                    )}

                    {!loadingSurahs && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                        >
                            {filteredSurahs.map((surah, i) => (
                                <motion.div
                                    key={surah.number}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(i * 0.01, 0.5) }}
                                    onClick={() => fetchAyahs(surah)}
                                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 p-4 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                                            {surah.number}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                                                    {surah.englishName}
                                                </h3>
                                                <span className="text-lg text-emerald-300 ml-2 flex-shrink-0">{surah.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500">{surah.numberOfAyahs} আয়াত</span>
                                                <span className="text-xs text-gray-600">•</span>
                                                <span className="text-xs text-gray-500">
                                                    {surah.revelationType === 'Meccan' ? '🕋 মক্কী' : '🕌 মাদানী'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </>
            )}

            {/* Ayah View */}
            <AnimatePresence>
                {selectedSurah && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Back */}
                        <button
                            onClick={() => { setSelectedSurah(null); setAyahs([]); stopAudio(); }}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm flex items-center gap-1 mb-4"
                        >
                            ← সূরা তালিকায় ফিরে যাও
                        </button>

                        {/* Surah Info */}
                        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 text-center mb-4">
                            <p className="text-4xl text-white mb-2">{selectedSurah.name}</p>
                            <h2 className="text-xl font-bold text-emerald-400">{selectedSurah.englishName}</h2>
                            <p className="text-gray-400 text-sm mt-1">{selectedSurah.englishNameTranslation}</p>
                            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
                                <span>📝 {selectedSurah.numberOfAyahs} আয়াত</span>
                                <span>•</span>
                                <span>{selectedSurah.revelationType === 'Meccan' ? '🕋 মক্কী' : '🕌 মাদানী'}</span>
                            </div>
                        </div>

                        {/* Qari Selector */}
                        <div className="mb-6">
                            <button
                                onClick={() => setShowQariSelector(!showQariSelector)}
                                className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between hover:bg-emerald-500/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎙️</span>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-400">কারী নির্বাচন করুন</p>
                                        <p className="text-white font-semibold">{selectedQari.name}</p>
                                        <p className="text-xs text-gray-500">{selectedQari.country} • {selectedQari.style}</p>
                                    </div>
                                </div>
                                <span className="text-emerald-400">{showQariSelector ? '▲' : '▼'}</span>
                            </button>

                            <AnimatePresence>
                                {showQariSelector && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 space-y-2"
                                    >
                                        {qaris.map(qari => (
                                            <div
                                                key={qari.id}
                                                onClick={() => {
                                                    setSelectedQari(qari);
                                                    setShowQariSelector(false);
                                                    stopAudio();
                                                }}
                                                className={`cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-all ${selectedQari.id === qari.id
                                                    ? 'border-emerald-500/50 bg-emerald-500/20'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <span className="text-xl">🎙️</span>
                                                <div className="flex-1">
                                                    <p className="text-white text-sm font-semibold">{qari.name}</p>
                                                    <p className="text-gray-500 text-xs">{qari.arabic} • {qari.country} • {qari.style}</p>
                                                </div>
                                                {selectedQari.id === qari.id && (
                                                    <span className="text-emerald-400">✓</span>
                                                )}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bismillah */}
                        {selectedSurah.number !== 9 && (
                            <div className="text-center mb-6 py-4 border-y border-white/10">
                                <p className="text-3xl text-amber-300">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                                <p className="text-gray-400 text-sm mt-2 italic">
                                    বিসমিল্লাহির রাহমানির রাহিম
                                </p>
                            </div>
                        )}

                        {/* Loading */}
                        {loadingAyahs && (
                            <div className="space-y-3">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-5 animate-pulse h-28" />
                                ))}
                            </div>
                        )}

                        {!loadingAyahs && (
                            <div className="space-y-3">
                                {ayahs.map((ayah, i) => (
                                    <div key={ayah.numberInSurah}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(i * 0.03, 0.8) }}
                                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${playingAyah === ayah.numberInSurah
                                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                                    : 'border-white/10 bg-white/5'
                                                }`}
                                        >
                                            {/* Top Bar */}
                                            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                                    {ayah.numberInSurah}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Play Button */}
                                                    <button
                                                        onClick={() => playAyah(selectedSurah.number, ayah.numberInSurah)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${playingAyah === ayah.numberInSurah
                                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                                : 'bg-white/10 text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-400'
                                                            }`}
                                                    >
                                                        {playingAyah === ayah.numberInSurah ? (
                                                            <><span className="animate-pulse">⏸</span> চলছে...</>
                                                        ) : (
                                                            <>▶ শুনুন</>
                                                        )}
                                                    </button>
                                                    {/* Expand */}
                                                    <button
                                                        onClick={() => setExpandedAyah(
                                                            expandedAyah === ayah.numberInSurah ? null : ayah.numberInSurah
                                                        )}
                                                        className="text-gray-500 hover:text-white transition-colors text-xs px-2"
                                                    >
                                                        {expandedAyah === ayah.numberInSurah ? '▲' : '▼'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Arabic */}
                                            <div className="px-4 pb-3">
                                                <p className="text-right text-2xl leading-loose text-white">
                                                    {ayah.text}
                                                </p>
                                            </div>

                                            {/* Expanded */}
                                            <AnimatePresence>
                                                {expandedAyah === ayah.numberInSurah && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="border-t border-white/10"
                                                    >
                                                        <div className="p-4 space-y-3">
                                                            {ayah.transliteration && (
                                                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                                                    <p className="text-xs text-amber-400 font-semibold mb-1">
                                                                        🔤 বাংলা উচ্চারণ
                                                                    </p>
                                                                    <p className="text-amber-200 text-sm italic leading-relaxed">
                                                                        {ayah.transliteration}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                                                                <p className="text-xs text-emerald-400 font-semibold mb-1">
                                                                    📖 বাংলা অর্থ
                                                                </p>
                                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                                    {ayah.translation}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* ✅ প্রতি ১০ আয়াত পর Analysis Button */}
                                        {ayah.numberInSurah % 10 === 0 && (
                                            <AnalysisPanel
                                                label={`আয়াত ${ayah.numberInSurah - 9} - ${ayah.numberInSurah} এর গভীর বিশ্লেষণ`}
                                                context="মূল শিক্ষা • রাসূল ﷺ এর আদর্শ • বিজ্ঞান • জীবনে প্রয়োগ"
                                                onAnalyze={async (): Promise<AnalysisResult | null> => {
                                                    const start = ayah.numberInSurah - 9
                                                    const end = ayah.numberInSurah
                                                    const chunk = ayahs.slice(start - 1, end)
                                                    const res = await fetch('/api/quran-analysis', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            surahName: selectedSurah.englishName,
                                                            surahNumber: selectedSurah.number,
                                                            ayahStart: start,
                                                            ayahEnd: end,
                                                            ayahTexts: chunk.map(a => a.text),
                                                            translations: chunk.map(a => a.translation),
                                                        }),
                                                    })
                                                    const data = await res.json()
                                                    return data.analysis || null
                                                }}
                                            />
                                        )}

                                        {/* ✅ শেষ আয়াত যদি ১০ এর multiple না হয় */}
                                        {i === ayahs.length - 1 && ayah.numberInSurah % 10 !== 0 && (
                                            <AnalysisPanel
                                                label={`আয়াত ${Math.floor(ayah.numberInSurah / 10) * 10 + 1} - ${ayah.numberInSurah} এর গভীর বিশ্লেষণ`}
                                                context="মূল শিক্ষা • রাসূল ﷺ এর আদর্শ • বিজ্ঞান • জীবনে প্রয়োগ"
                                                onAnalyze={async (): Promise<AnalysisResult | null> => {
                                                    const start = Math.floor(ayah.numberInSurah / 10) * 10 + 1
                                                    const chunk = ayahs.slice(start - 1)
                                                    const res = await fetch('/api/quran-analysis', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            surahName: selectedSurah.englishName,
                                                            surahNumber: selectedSurah.number,
                                                            ayahStart: start,
                                                            ayahEnd: ayah.numberInSurah,
                                                            ayahTexts: chunk.map(a => a.text),
                                                            translations: chunk.map(a => a.translation),
                                                        }),
                                                    })
                                                    const data = await res.json()
                                                    return data.analysis || null
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Now Playing Bar */}
                        <AnimatePresence>
                            {playingAyah !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-50"
                                >
                                    <div className="rounded-2xl bg-[#0f1f1a] border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 p-4 flex items-center justify-between backdrop-blur-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                <span className="text-emerald-400 animate-pulse text-xl">🎵</span>
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-semibold">
                                                    সূরা {selectedSurah.englishName} • আয়াত {playingAyah}
                                                </p>
                                                <p className="text-gray-400 text-xs">{selectedQari.name}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={stopAudio}
                                            className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                                        >
                                            ⏹
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}