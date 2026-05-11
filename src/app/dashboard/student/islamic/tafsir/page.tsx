'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const tafsirData = [
  {
    surah: 'আল-ফাতিহা',
    number: 1,
    ayahs: 7,
    theme: 'প্রশংসা ও পথপ্রদর্শনার দোয়া',
    icon: '🌟',
    color: 'from-amber-500 to-yellow-500',
    verses: [
      {
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        bangla: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি।',
        tafsir: 'বিসমিল্লাহ দিয়ে প্রতিটি ভালো কাজ শুরু করা সুন্নত। এর মাধ্যমে আমরা আল্লাহর রহমত ও বরকত কামনা করি। রহমান অর্থ দুনিয়ায় সকলের প্রতি দয়ালু, রহিম অর্থ আখিরাতে মুমিনদের প্রতি বিশেষভাবে দয়ালু।',
        ayah: 1,
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        bangla: 'সমস্ত প্রশংসা আল্লাহর জন্য, যিনি সকল জগতের পালনকর্তা।',
        tafsir: 'আলহামদুলিল্লাহ — এই বাক্যটি সর্বোত্তম যিকর। আল্লাহ সকল সৃষ্টির রব, শুধু মানুষের নয়। "আলামিন" শব্দটি বহুবচন, যা সমস্ত জগৎকে নির্দেশ করে — মানব জগৎ, জিন জগৎ, ফেরেশতা জগৎ সবকিছু।',
        ayah: 2,
      },
      {
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        bangla: 'আমরা শুধু তোমারই ইবাদত করি এবং শুধু তোমারই সাহায্য প্রার্থনা করি।',
        tafsir: 'এই আয়াতটি তাওহিদের মূল ভিত্তি। ইবাদত শুধু আল্লাহর জন্য এবং সাহায্য প্রার্থনাও শুধু আল্লাহর কাছে। এখানে "নাকবুদু" (আমরা ইবাদত করি) বলা হয়েছে — একা নয়, উম্মাহ হিসেবে একসাথে।',
        ayah: 5,
      },
    ],
  },
  {
    surah: 'আল-বাকারা',
    number: 2,
    ayahs: 286,
    theme: 'ইসলামি জীবনব্যবস্থার পূর্ণ দিকনির্দেশনা',
    icon: '📖',
    color: 'from-blue-500 to-indigo-500',
    verses: [
      {
        arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
        bangla: 'এই সেই কিতাব, যাতে কোনো সন্দেহ নেই, মুত্তাকিদের জন্য পথপ্রদর্শক।',
        tafsir: 'কুরআন সম্পূর্ণ সত্য ও নির্ভুল গ্রন্থ। এটি মুত্তাকি অর্থাৎ আল্লাহভীরুদের জন্য হিদায়াত। মুত্তাকি তারাই যারা আল্লাহকে ভয় করে এবং তাঁর আদেশ মেনে চলে।',
        ayah: 2,
      },
      {
        arabic: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ',
        bangla: 'এবং নামাজ কায়েম করো এবং যাকাত প্রদান করো।',
        tafsir: 'নামাজ ও যাকাত ইসলামের দুটি মূল স্তম্ভ। "আকামুস সালাহ" মানে শুধু পড়া নয়, পূর্ণভাবে প্রতিষ্ঠা করা — সময়মতো, সঠিকভাবে, খুশু-খুযুসহ।',
        ayah: 43,
      },
    ],
  },
  {
    surah: 'আল-ইখলাস',
    number: 112,
    ayahs: 4,
    theme: 'আল্লাহর একত্বের ঘোষণা',
    icon: '☝️',
    color: 'from-emerald-500 to-green-500',
    verses: [
      {
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        bangla: 'বলুন, তিনি আল্লাহ, এক অদ্বিতীয়।',
        tafsir: 'এই সূরাটি তাওহিদের সারসংক্ষেপ। আল্লাহ এক — তাঁর কোনো শরিক নেই, কোনো সমকক্ষ নেই। এই সূরা কুরআনের এক তৃতীয়াংশের সমতুল্য বলে হাদিসে বর্ণিত হয়েছে।',
        ayah: 1,
      },
      {
        arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        bangla: 'তিনি কাউকে জন্ম দেননি এবং তাঁকেও জন্ম দেওয়া হয়নি।',
        tafsir: 'আল্লাহ সন্তান গ্রহণ করেননি এবং তিনি কারো সন্তান নন। এটি খ্রিস্টান ও মুশরিকদের আকিদার সরাসরি প্রত্যাখ্যান।',
        ayah: 3,
      },
    ],
  },
  {
    surah: 'আল-কাউসার',
    number: 108,
    ayahs: 3,
    theme: 'নবীজির প্রতি আল্লাহর অনুগ্রহ',
    icon: '🌊',
    color: 'from-cyan-500 to-sky-500',
    verses: [
      {
        arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        bangla: 'নিশ্চয়ই আমি তোমাকে কাউসার দান করেছি।',
        tafsir: 'কাউসার হলো জান্নাতের একটি নহর যা নবী ﷺ-কে দেওয়া হয়েছে। কিয়ামতের দিন মুমিনরা এই হাউজ থেকে পানি পান করবেন। কাউসার মানে অফুরন্ত কল্যাণও।',
        ayah: 1,
      },
    ],
  },
];

export default function TafsirPage() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<(typeof tafsirData[0]['verses'][0]) | null>(null);

  const currentSurah = tafsirData.find(s => s.number === selectedSurah);

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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
            📜
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              তাফসির
            </h1>
            <p className="text-gray-400 mt-1">কুরআনের আয়াতের ব্যাখ্যা ও বিশ্লেষণ</p>
          </div>
        </div>
      </motion.div>

      {/* Surah Grid */}
      {!selectedSurah && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tafsirData.map((surah, i) => (
            <motion.div
              key={surah.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedSurah(surah.number)}
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 p-5 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${surah.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                  {surah.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                      সূরা {surah.surah}
                    </h3>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                      #{surah.number}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{surah.theme}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>📝 {surah.ayahs} আয়াত</span>
                    <span>🔍 {surah.verses.length}টি তাফসির</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Verse List */}
      {selectedSurah && currentSurah && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedSurah(null)}
              className="text-amber-400 hover:text-amber-300 transition-colors text-sm flex items-center gap-1"
            >
              ← সূরা তালিকায় ফিরে যাও
            </button>
          </div>

          <div className={`w-full rounded-2xl bg-gradient-to-r ${currentSurah.color} p-px mb-6`}>
            <div className="rounded-2xl bg-[#0f0f2a] p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentSurah.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">সূরা {currentSurah.surah}</h2>
                  <p className="text-gray-400 text-sm">{currentSurah.theme}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {currentSurah.verses.map((verse, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedVerse(selectedVerse?.ayah === verse.ayah ? null : verse)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition-all"
              >
                {/* Arabic */}
                <p className="text-2xl text-right text-amber-300 font-arabic leading-loose mb-3">
                  {verse.arabic}
                </p>
                {/* Bangla */}
                <p className="text-gray-300 mb-2 text-sm leading-relaxed">{verse.bangla}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">আয়াত নং {verse.ayah}</span>
                  <span className="text-xs text-amber-400">
                    {selectedVerse?.ayah === verse.ayah ? '▲ তাফসির লুকাও' : '▼ তাফসির দেখো'}
                  </span>
                </div>

                {/* Tafsir Expansion */}
                <AnimatePresence>
                  {selectedVerse?.ayah === verse.ayah && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-xs text-amber-400 font-semibold mb-2">📚 তাফসির</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{verse.tafsir}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}