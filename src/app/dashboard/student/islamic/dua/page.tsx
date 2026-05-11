'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const duaCategories = [
    {
        id: 1,
        category: 'দৈনন্দিন দোয়া',
        icon: '🌅',
        color: 'from-amber-500 to-orange-500',
        duas: [
            {
                title: 'ঘুম থেকে উঠার দোয়া',
                arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
                bangla: 'সমস্ত প্রশংসা আল্লাহর যিনি আমাদের মৃত্যুর পর জীবিত করলেন এবং তাঁর কাছেই পুনরুত্থান।',
                transliteration: 'আলহামদুলিল্লাহিল্লাজি আহয়ানা বা\'দা মা আমাতানা ওয়া ইলাইহিন নুশুর।',
                source: 'বুখারি ও মুসলিম',
                when: 'ঘুম থেকে উঠার সাথে সাথে',
            },
            {
                title: 'ঘুমানোর দোয়া',
                arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
                bangla: 'হে আল্লাহ! তোমার নামে মরি এবং বাঁচি।',
                transliteration: 'বিসমিকাল্লাহুম্মা আমুতু ওয়া আহইয়া।',
                source: 'বুখারি',
                when: 'ঘুমানোর আগে',
            },
            {
                title: 'খাবার খাওয়ার আগে',
                arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
                bangla: 'আল্লাহর নামে এবং আল্লাহর বরকতের উপর (শুরু করছি)।',
                transliteration: 'বিসমিল্লাহি ওয়া আলা বারাকাতিল্লাহ।',
                source: 'আবু দাউদ',
                when: 'খাবার শুরুর আগে',
            },
            {
                title: 'খাবার শেষে',
                arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ',
                bangla: 'সমস্ত প্রশংসা আল্লাহর যিনি আমাকে এটা খাইয়েছেন এবং রিজিক দিয়েছেন।',
                transliteration: 'আলহামদুলিল্লাহিল্লাজি আত\'আমানি হাজা ওয়া রাযাকানিহি।',
                source: 'তিরমিজি',
                when: 'খাবার শেষে',
            },
        ],
    },
    {
        id: 2,
        category: 'নামাজের দোয়া',
        icon: '🕌',
        color: 'from-emerald-500 to-teal-500',
        duas: [
            {
                title: 'নামাজ শুরুর দোয়া (সানা)',
                arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
                bangla: 'হে আল্লাহ! তুমি পবিত্র, তোমার প্রশংসা করি, তোমার নাম বরকতময়, তোমার মর্যাদা সুউচ্চ এবং তুমি ছাড়া কোনো ইলাহ নেই।',
                transliteration: 'সুবহানাকাল্লাহুম্মা ওয়া বিহামদিকা ওয়া তাবারাকাসমুকা ওয়া তাআলা জাদ্দুকা ওয়া লা ইলাহা গাইরুক।',
                source: 'তিরমিজি, আবু দাউদ',
                when: 'নামাজের শুরুতে তাকবিরের পর',
            },
            {
                title: 'রুকুর তাসবিহ',
                arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
                bangla: 'আমার মহান রবের পবিত্রতা বর্ণনা করি।',
                transliteration: 'সুবহানা রাব্বিয়াল আজিম।',
                source: 'মুসলিম',
                when: 'রুকুতে (কমপক্ষে ৩ বার)',
            },
            {
                title: 'সিজদার তাসবিহ',
                arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
                bangla: 'আমার সর্বোচ্চ রবের পবিত্রতা বর্ণনা করি।',
                transliteration: 'সুবহানা রাব্বিয়াল আ\'লা।',
                source: 'মুসলিম',
                when: 'সিজদায় (কমপক্ষে ৩ বার)',
            },
        ],
    },
    {
        id: 3,
        category: 'কুরআনিক দোয়া',
        icon: '📖',
        color: 'from-violet-500 to-purple-500',
        duas: [
            {
                title: 'হিদায়াতের দোয়া',
                arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
                bangla: 'হে আমাদের রব! হিদায়াত দেওয়ার পর আমাদের অন্তরকে বিচ্যুত করো না।',
                transliteration: 'রাব্বানা লা তুযিগ কুলুবানা বা\'দা ইজ হাদাইতানা।',
                source: 'সূরা আল ইমরান: ৮',
                when: 'যেকোনো সময়',
            },
            {
                title: 'দুনিয়া ও আখিরাতের কল্যাণ',
                arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                bangla: 'হে আমাদের রব! দুনিয়ায় কল্যাণ দাও, আখিরাতে কল্যাণ দাও এবং জাহান্নামের আজাব থেকে রক্ষা করো।',
                transliteration: 'রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাতাও ওয়া ফিল আখিরাতি হাসানাতাও ওয়া কিনা আজাবান নার।',
                source: 'সূরা বাকারা: ২০১',
                when: 'সর্বোত্তম দোয়া — যেকোনো সময়',
            },
            {
                title: 'ক্ষমার দোয়া',
                arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
                bangla: 'হে আমাদের রব! আমরা নিজেদের উপর জুলুম করেছি। যদি তুমি আমাদের ক্ষমা না করো এবং দয়া না করো, তাহলে আমরা ক্ষতিগ্রস্তদের অন্তর্ভুক্ত হবো।',
                transliteration: 'রাব্বানা জলামনা আনফুসানা ওয়া ইল্লাম তাগফিরলানা ওয়া তারহামনা লানাকুনান্না মিনাল খাসিরিন।',
                source: 'সূরা আ\'রাফ: ২৩',
                when: 'তওবার সময়',
            },
        ],
    },
    {
        id: 4,
        category: 'বিশেষ দোয়া',
        icon: '⭐',
        color: 'from-blue-500 to-indigo-500',
        duas: [
            {
                title: 'পরীক্ষায় সাফল্যের দোয়া',
                arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
                bangla: 'হে আমার রব! আমার বুক প্রশস্ত করে দাও এবং আমার কাজ সহজ করে দাও।',
                transliteration: 'রাব্বিশরাহলি সাদরি ওয়া ইয়াস্সিরলি আমরি।',
                source: 'সূরা ত্বা-হা: ২৫-২৬',
                when: 'পরীক্ষা বা কঠিন কাজের আগে',
            },
            {
                title: 'উদ্বেগ ও দুশ্চিন্তার দোয়া',
                arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
                bangla: 'হে আল্লাহ! আমি দুশ্চিন্তা ও দুঃখ থেকে তোমার আশ্রয় চাই।',
                transliteration: 'আল্লাহুম্মা ইন্নি আউজুবিকা মিনাল হাম্মি ওয়াল হাযান।',
                source: 'বুখারি',
                when: 'মানসিক চাপ বা দুশ্চিন্তার সময়',
            },
            {
                title: 'জ্ঞান বৃদ্ধির দোয়া',
                arabic: 'رَّبِّ زِدْنِي عِلْمًا',
                bangla: 'হে আমার রব! আমার জ্ঞান বাড়িয়ে দাও।',
                transliteration: 'রাব্বি যিদনি ইলমা।',
                source: 'সূরা ত্বা-হা: ১১৪',
                when: 'পড়াশোনার আগে',
            },
            {
                title: 'ইস্তেগফার (ক্ষমাপ্রার্থনা)',
                arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
                bangla: 'আমি মহান আল্লাহর কাছে ক্ষমা চাই যিনি ছাড়া কোনো ইলাহ নেই, যিনি চিরঞ্জীব, চিরস্থায়ী এবং আমি তাঁর কাছে তওবা করি।',
                transliteration: 'আস্তাগফিরুল্লাহাল আজিমাল্লাজি লা ইলাহা ইল্লা হুওয়াল হাইয়্যুল কাইয়্যুম ওয়া আতুবু ইলাইহি।',
                source: 'তিরমিজি, আবু দাউদ',
                when: 'যেকোনো সময়, বিশেষত সকাল-বিকাল',
            },
        ],
    },
];

export default function DuaPage() {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [expandedDua, setExpandedDua] = useState<string | null>(null);
    const [copiedDua, setCopiedDua] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const currentCategory = duaCategories.find(c => c.id === selectedCategory);

    const handleCopy = (arabic: string, title: string) => {
        navigator.clipboard.writeText(arabic);
        setCopiedDua(title);
        setTimeout(() => setCopiedDua(null), 2000);
    };

    // Search across all duas
    const searchResults = searchQuery.length > 1
        ? duaCategories.flatMap(cat =>
            cat.duas
                .filter(d =>
                    d.title.includes(searchQuery) ||
                    d.bangla.includes(searchQuery) ||
                    d.transliteration.includes(searchQuery)
                )
                .map(d => ({ ...d, category: cat.category, color: cat.color }))
        )
        : [];

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
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
                        🤲
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            দোয়া সমূহ
                        </h1>
                        <p className="text-gray-400 mt-1">কুরআন ও হাদিস থেকে প্রামাণিক দোয়া</p>
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <input
                    type="text"
                    placeholder="দোয়া খুঁজুন... (বাংলায় লিখুন)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
            </motion.div>

            {/* Search Results */}
            <AnimatePresence>
                {searchQuery.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mb-6"
                    >
                        <p className="text-gray-400 text-sm mb-3">{searchResults.length}টি দোয়া পাওয়া গেছে</p>
                        <div className="space-y-3">
                            {searchResults.map((dua, i) => (
                                <DuaCard
                                    key={i}
                                    dua={dua}
                                    expanded={expandedDua === dua.title}
                                    onToggle={() => setExpandedDua(expandedDua === dua.title ? null : dua.title)}
                                    onCopy={() => handleCopy(dua.arabic, dua.title)}
                                    copied={copiedDua === dua.title}
                                    color={dua.color}
                                />
                            ))}
                            {searchResults.length === 0 && (
                                <p className="text-gray-500 text-center py-8">কোনো দোয়া পাওয়া যায়নি</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Grid */}
            {!searchQuery && !selectedCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {duaCategories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 p-5 transition-all duration-300 group"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-4 shadow-md`}>
                                {cat.icon}
                            </div>
                            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors mb-1">
                                {cat.category}
                            </h3>
                            <p className="text-gray-400 text-sm">{cat.duas.length}টি দোয়া</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Dua List */}
            {!searchQuery && selectedCategory && currentCategory && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => { setSelectedCategory(null); setExpandedDua(null); }}
                            className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1"
                        >
                            ← দোয়ার ক্যাটাগরিতে ফিরে যাও
                        </button>
                    </div>

                    <div className={`rounded-2xl bg-gradient-to-r ${currentCategory.color} p-px mb-6`}>
                        <div className="rounded-2xl bg-[#0f0f2a] p-5 flex items-center gap-4">
                            <span className="text-4xl">{currentCategory.icon}</span>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{currentCategory.category}</h2>
                                <p className="text-gray-400">{currentCategory.duas.length}টি দোয়া</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {currentCategory.duas.map((dua, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <DuaCard
                                    dua={dua}
                                    expanded={expandedDua === dua.title}
                                    onToggle={() => setExpandedDua(expandedDua === dua.title ? null : dua.title)}
                                    onCopy={() => handleCopy(dua.arabic, dua.title)}
                                    copied={copiedDua === dua.title}
                                    color={currentCategory.color}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Dua Card Component
function DuaCard({
    dua,
    expanded,
    onToggle,
    onCopy,
    copied,
    color,
}: {
    dua: {
        title: string;
        arabic: string;
        bangla: string;
        transliteration: string;
        source: string;
        when: string;
    };
    expanded: boolean;
    onToggle: () => void;
    onCopy: () => void;
    copied: boolean;
    color: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            {/* Header */}
            <div
                className="cursor-pointer p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                onClick={onToggle}
            >
                <h4 className="font-semibold text-white">{dua.title}</h4>
                <span className="text-gray-500 ml-2">{expanded ? '▲' : '▼'}</span>
            </div>

            {/* Arabic preview */}
            <div className="px-4 pb-3">
                <p className="text-right text-blue-300 text-xl leading-loose line-clamp-1">{dua.arabic}</p>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                            {/* Full Arabic */}
                            <div className={`rounded-xl bg-gradient-to-r ${color} p-px`}>
                                <div className="rounded-xl bg-[#0f0f2a] p-4">
                                    <p className="text-right text-2xl leading-loose text-white font-arabic">
                                        {dua.arabic}
                                    </p>
                                </div>
                            </div>

                            {/* Transliteration */}
                            <div className="bg-white/5 rounded-xl p-3">
                                <p className="text-xs text-gray-500 mb-1">উচ্চারণ</p>
                                <p className="text-blue-300 text-sm italic">{dua.transliteration}</p>
                            </div>

                            {/* Bangla */}
                            <div className="bg-white/5 rounded-xl p-3">
                                <p className="text-xs text-gray-500 mb-1">অর্থ</p>
                                <p className="text-gray-300 text-sm leading-relaxed">{dua.bangla}</p>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                                    📚 {dua.source}
                                </span>
                                <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                                    🕐 {dua.when}
                                </span>
                            </div>

                            {/* Copy button */}
                            <button
                                onClick={e => { e.stopPropagation(); onCopy(); }}
                                className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                {copied ? '✅ কপি হয়েছে!' : '📋 আরবি কপি করুন'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}