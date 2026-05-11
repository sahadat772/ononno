'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const sirahTimeline = [
    {
        id: 1,
        era: 'জন্ম ও শৈশব',
        year: '৫৭০ - ৫৯৫ খ্রি.',
        icon: '⭐',
        color: 'from-amber-500 to-yellow-500',
        bgColor: 'amber',
        events: [
            {
                title: 'নবীজির জন্ম ﷺ',
                date: '৫৭০ খ্রিস্টাব্দ, ১২ রবিউল আউয়াল',
                detail: 'মক্কার বিখ্যাত কুরাইশ বংশে আবদুল্লাহ ও আমিনার ঘরে জন্মগ্রহণ করেন। জন্মের আগেই পিতা আবদুল্লাহ মারা যান। হাতির বছরে (আমুল ফিল) এই মহান শিশুর আগমন ঘটে।',
                importance: 'high',
            },
            {
                title: 'হালিমা সাদিয়ার কাছে লালন-পালন',
                date: '৫৭০ - ৫৭৫ খ্রি.',
                detail: 'আরবের রীতি অনুযায়ী দুধমাতা হালিমা সাদিয়ার কাছে প্রতিপালিত হন। হালিমার পরিবারে তখন থেকে বরকত নেমে আসে। বুকচিরা ঘটনা (শাক্কুস সদর) এই সময়ে ঘটে।',
                importance: 'medium',
            },
            {
                title: 'মায়ের মৃত্যু ও দাদার কাছে',
                date: '৫৭৬ খ্রি.',
                detail: 'মাত্র ৬ বছর বয়সে মা আমিনা মারা যান। এরপর দাদা আবদুল মুত্তালিবের তত্ত্বাবধানে থাকেন। দুই বছর পর দাদাও মারা যান। চাচা আবু তালিব তাঁকে আশ্রয় দেন।',
                importance: 'medium',
            },
            {
                title: 'সিরিয়া সফর ও বাহিরার ভবিষ্যদ্বাণী',
                date: '৫৮২ খ্রি.',
                detail: 'চাচা আবু তালিবের সাথে সিরিয়া যাওয়ার পথে বাহিরা নামক খ্রিস্টান পাদ্রি তাঁকে দেখে চিনতে পারেন এবং শেষ নবী হওয়ার ভবিষ্যদ্বাণী করেন।',
                importance: 'high',
            },
        ],
    },
    {
        id: 2,
        era: 'যৌবন ও বিবাহ',
        year: '৫৯৫ - ৬১০ খ্রি.',
        icon: '💍',
        color: 'from-rose-500 to-pink-500',
        bgColor: 'rose',
        events: [
            {
                title: 'আল-আমিন উপাধি',
                date: '৫৯৫ খ্রি.',
                detail: 'সততা ও বিশ্বস্ততার জন্য মক্কাবাসী তাঁকে "আল-আমিন" (বিশ্বস্ত) উপাধি দেন। সকলে তাঁর কাছে আমানত রাখতেন।',
                importance: 'high',
            },
            {
                title: 'খাদিজা রা. এর সাথে বিবাহ',
                date: '৫৯৫ খ্রি.',
                detail: 'ধনী ব্যবসায়ী বিধবা খাদিজা রা. তাঁর সততায় মুগ্ধ হয়ে বিবাহের প্রস্তাব পাঠান। তখন নবীজির বয়স ২৫ ও খাদিজার ৪০। এটি ছিল অত্যন্ত সুখী দাম্পত্য।',
                importance: 'high',
            },
            {
                title: 'কাবার পুনর্নির্মাণ ও হাজরে আসওয়াদ',
                date: '৬০৫ খ্রি.',
                detail: 'কাবা পুনর্নির্মাণের সময় হাজরে আসওয়াদ স্থাপন নিয়ে গোত্রগুলোর মধ্যে বিবাদ হয়। নবীজি ﷺ বুদ্ধিমত্তার সাথে সকলকে সন্তুষ্ট করে পাথরটি স্থাপন করেন।',
                importance: 'medium',
            },
        ],
    },
    {
        id: 3,
        era: 'নবুওয়াত ও মক্কী জীবন',
        year: '৬১০ - ৬২২ খ্রি.',
        icon: '🌙',
        color: 'from-violet-500 to-purple-500',
        bgColor: 'violet',
        events: [
            {
                title: 'প্রথম ওহী নাজিল',
                date: '৬১০ খ্রি., রমজান মাস',
                detail: 'হেরা গুহায় ধ্যানরত অবস্থায় জিব্রাইল আ. এসে ইকরা বিসমি রাব্বিকাল্লাজি খালাক — এই আয়াত নাজিল করেন। এটিই ইসলামের সূচনা।',
                importance: 'high',
            },
            {
                title: 'ইসরা ও মিরাজ',
                date: '৬২০ খ্রি.',
                detail: 'এক রাতে মসজিদুল হারাম থেকে মসজিদুল আকসায় (ইসরা) এবং সেখান থেকে সপ্ত আকাশ পেরিয়ে আল্লাহর সান্নিধ্যে (মিরাজ) যান। পাঁচ ওয়াক্ত নামাজ এই রাতে ফরজ হয়।',
                importance: 'high',
            },
            {
                title: 'হাবশায় হিজরত',
                date: '৬১৫ খ্রি.',
                detail: 'মুসলিমদের উপর অত্যাচার বাড়লে নবীজি ﷺ কিছু সাহাবাকে হাবশায় (ইথিওপিয়া) হিজরত করতে বলেন। সেখানকার ন্যায়পরায়ণ রাজা নাজাশি তাদের আশ্রয় দেন।',
                importance: 'medium',
            },
        ],
    },
    {
        id: 4,
        era: 'মদিনায় হিজরত',
        year: '৬২২ - ৬৩২ খ্রি.',
        icon: '🕌',
        color: 'from-emerald-500 to-teal-500',
        bgColor: 'emerald',
        events: [
            {
                title: 'মদিনায় হিজরত',
                date: '৬২২ খ্রি.',
                detail: 'মক্কার মুশরিকরা হত্যার পরিকল্পনা করলে আল্লাহর নির্দেশে মদিনায় হিজরত করেন। আবু বকর রা. সঙ্গী হন। সাওর গুহায় আশ্রয় নিয়ে তিন দিন পর মদিনায় পৌঁছান। হিজরি সন এখান থেকেই শুরু।',
                importance: 'high',
            },
            {
                title: 'মদিনা সনদ',
                date: '৬২৩ খ্রি.',
                detail: 'মদিনার মুসলিম, ইহুদি ও অন্যান্য গোত্রের মধ্যে শান্তিচুক্তি। পৃথিবীর প্রথম লিখিত সংবিধান হিসেবে বিবেচিত।',
                importance: 'high',
            },
            {
                title: 'বদরের যুদ্ধ',
                date: '৬২৪ খ্রি., ১৭ রমজান',
                detail: '৩১৩ জন মুসলিম ১০০০ কুরাইশ সৈন্যের বিরুদ্ধে যুদ্ধ করে বিজয়ী হন। আবু জেহেলসহ ৭০ জন কাফির নিহত হয়। এটি ইসলামের প্রথম বড় যুদ্ধ।',
                importance: 'high',
            },
            {
                title: 'বিদায় হজ্জ ও ইন্তেকাল',
                date: '৬৩২ খ্রি.',
                detail: 'বিদায় হজ্জে ১ লক্ষ ২৪ হাজার সাহাবার সামনে ঐতিহাসিক ভাষণ দেন। সেই বছরই ১২ রবিউল আউয়াল ৬৩ বছর বয়সে ইন্তেকাল করেন। ইন্না লিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন।',
                importance: 'high',
            },
        ],
    },
];

const importanceColor: Record<string, string> = {
    high: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    medium: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
};

const importanceLabel: Record<string, string> = {
    high: '⭐ গুরুত্বপূর্ণ',
    medium: '📌 উল্লেখযোগ্য',
};

export default function SirahPage() {
    const [selectedEra, setSelectedEra] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

    const currentEra = sirahTimeline.find(e => e.id === selectedEra);

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
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                        🌙
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                            সিরাতুন নবী ﷺ
                        </h1>
                        <p className="text-gray-400 mt-1">মহানবী হযরত মুহাম্মদ ﷺ এর জীবনী</p>
                    </div>
                </div>
            </motion.div>

            {/* Quote */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 rounded-2xl bg-linear-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-5 text-center"
            >
                <p className="text-violet-300 text-lg font-medium">
                    لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ
                </p>
                <p className="text-gray-400 text-sm mt-2">
                    `তোমাদের জন্য রাসূলুল্লাহর মধ্যে রয়েছে উত্তম আদর্শ। — সূরা আহযাব: ২১`
                </p>
            </motion.div>

            {/* Timeline */}
            {!selectedEra ? (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-violet-500 to-emerald-500 hidden md:block" />

                    <div className="space-y-6">
                        {sirahTimeline.map((era, i) => (
                            <motion.div
                                key={era.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className="md:pl-16 relative"
                            >
                                {/* Timeline dot */}
                                <div className={`absolute left-4 top-6 w-7 h-7 rounded-full bg-gradient-to-br ${era.color} hidden md:flex items-center justify-center text-sm shadow-lg`}>
                                    {era.icon}
                                </div>

                                <div
                                    onClick={() => setSelectedEra(era.id)}
                                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/30 p-5 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${era.color} flex items-center justify-center text-2xl md:hidden flex-shrink-0`}>
                                            {era.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-bold text-xl text-white group-hover:text-violet-400 transition-colors">
                                                    {era.era}
                                                </h3>
                                                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                                                    {era.year}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-1">{era.events.length}টি ঘটনা</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {era.events.slice(0, 3).map((ev, j) => (
                                            <span key={j} className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                                {ev.title}
                                            </span>
                                        ))}
                                        {era.events.length > 3 && (
                                            <span className="text-xs text-violet-400 px-2 py-1">+{era.events.length - 3} আরও</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Era Detail */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button
                        onClick={() => { setSelectedEra(null); setSelectedEvent(null); }}
                        className="text-violet-400 hover:text-violet-300 transition-colors text-sm flex items-center gap-1 mb-6"
                    >
                        ← টাইমলাইনে ফিরে যাও
                    </button>

                    {currentEra && (
                        <>
                            <div className={`rounded-2xl bg-gradient-to-r ${currentEra.color} p-px mb-6`}>
                                <div className="rounded-2xl bg-[#0f0f2a] p-5 flex items-center gap-4">
                                    <span className="text-4xl">{currentEra.icon}</span>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{currentEra.era}</h2>
                                        <p className="text-gray-400">{currentEra.year}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {currentEra.events.map((event, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => setSelectedEvent(selectedEvent === event.title ? null : event.title)}
                                        className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white text-lg mb-1">{event.title}</h4>
                                                <p className="text-gray-500 text-xs mb-2">📅 {event.date}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${importanceColor[event.importance]}`}>
                                                    {importanceLabel[event.importance]}
                                                </span>
                                            </div>
                                            <span className="text-gray-500 text-sm mt-1">
                                                {selectedEvent === event.title ? '▲' : '▼'}
                                            </span>
                                        </div>

                                        <AnimatePresence>
                                            {selectedEvent === event.title && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 pt-4 border-t border-white/10"
                                                >
                                                    <p className="text-gray-300 text-sm leading-relaxed">{event.detail}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}