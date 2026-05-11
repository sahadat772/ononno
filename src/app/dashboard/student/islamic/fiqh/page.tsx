'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const fiqhTopics = [
    {
        id: 1,
        category: 'পবিত্রতা (তাহারাত)',
        icon: '💧',
        color: 'from-blue-500 to-cyan-500',
        topics: [
            { title: 'ওযু', desc: 'ওযুর ফরজ, সুন্নত ও মাকরূহ', details: 'ওযুর ফরজ ৪টি: মুখ ধোয়া, উভয় হাত কনুই পর্যন্ত ধোয়া, মাথার চার ভাগের এক ভাগ মাসেহ করা, উভয় পা টাখনু পর্যন্ত ধোয়া।' },
            { title: 'গোসল', desc: 'ফরজ গোসলের নিয়ম ও পদ্ধতি', details: 'গোসলের ফরজ ৩টি: কুলি করা, নাকে পানি দেওয়া, সমস্ত শরীরে পানি পৌঁছানো।' },
            { title: 'তায়াম্মুম', desc: 'পানি না পেলে তায়াম্মুমের বিধান', details: 'পানি না পাওয়া গেলে বা পানি ব্যবহারে ক্ষতির আশঙ্কা থাকলে তায়াম্মুম করা জায়েজ।' },
        ]
    },
    {
        id: 2,
        category: 'নামাজ (সালাত)',
        icon: '🕌',
        color: 'from-emerald-500 to-teal-500',
        topics: [
            { title: 'নামাজের ওয়াক্ত', desc: 'পাঁচ ওয়াক্ত নামাজের সময়সূচি', details: 'ফজর, যোহর, আসর, মাগরিব ও এশা — এই পাঁচ ওয়াক্ত নামাজ প্রতিদিন আদায় করা ফরজ।' },
            { title: 'নামাজের ফরজ', desc: 'নামাজের ভেতরে ও বাইরের ফরজ', details: 'নামাজের বাইরে ৭টি ও ভেতরে ৬টি ফরজ রয়েছে।' },
            { title: 'জামাতে নামাজ', desc: 'জামাতের ফজিলত ও নিয়মকানুন', details: 'জামাতে নামাজ একা পড়ার চেয়ে ২৭ গুণ বেশি সওয়াব।' },
        ]
    },
    {
        id: 3,
        category: 'রোজা (সিয়াম)',
        icon: '🌙',
        color: 'from-purple-500 to-violet-500',
        topics: [
            { title: 'রোজার নিয়ম', desc: 'রমজানের রোজার ফরজ ও বিধান', details: 'রমজান মাসে রোজা রাখা প্রতিটি সুস্থ-সবল মুসলিমের উপর ফরজ।' },
            { title: 'রোজা ভাঙার কারণ', desc: 'কী কী কারণে রোজা নষ্ট হয়', details: 'ইচ্ছাকৃতভাবে খাওয়া, পান করা বা স্ত্রী-সম্ভোগ করলে রোজা নষ্ট হয় এবং কাফফারা ওয়াজিব হয়।' },
        ]
    },
    {
        id: 4,
        category: 'যাকাত',
        icon: '💰',
        color: 'from-amber-500 to-yellow-500',
        topics: [
            { title: 'যাকাতের নিসাব', desc: 'কত সম্পদে যাকাত ফরজ হয়', details: 'সাড়ে সাত তোলা সোনা বা সাড়ে বায়ান্ন তোলা রূপার সমতুল্য সম্পদ এক বছর থাকলে যাকাত ফরজ।' },
            { title: 'যাকাতের হিসাব', desc: 'মোট সম্পদের ২.৫% যাকাত', details: 'মোট যাকাতযোগ্য সম্পদের ২.৫% (১/৪০ অংশ) যাকাত হিসেবে প্রদান করতে হবে।' },
        ]
    },
    {
        id: 5,
        category: 'হজ্জ',
        icon: '🕋',
        color: 'from-rose-500 to-pink-500',
        topics: [
            { title: 'হজ্জের ফরজ', desc: 'হজ্জের মূল রুকনসমূহ', details: 'হজ্জের ফরজ ৩টি: ইহরাম বাঁধা, আরাফায় অবস্থান, তাওয়াফে যিয়ারত।' },
            { title: 'হজ্জের প্রকার', desc: 'ইফরাদ, কিরান ও তামাত্তু', details: 'হজ্জ তিন প্রকার: ইফরাদ (শুধু হজ্জ), কিরান (হজ্জ ও ওমরাহ একসাথে) এবং তামাত্তু (আলাদাভাবে)।' },
        ]
    },
];

export default function FiqhPage() {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<{ title: string; desc: string; details: string } | null>(null);

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
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg">
                        📖
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            ফিকহ শিক্ষা
                        </h1>
                        <p className="text-gray-400 mt-1">ইসলামি আইন ও বিধিবিধান</p>
                    </div>
                </div>
            </motion.div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {fiqhTopics.map((cat, i) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${selectedCategory === cat.id
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-3 shadow-md`}>
                            {cat.icon}
                        </div>
                        <h3 className="font-semibold text-lg text-white mb-1">{cat.category}</h3>
                        <p className="text-gray-400 text-sm">{cat.topics.length}টি বিষয়</p>
                    </motion.div>
                ))}
            </div>

            {/* Topics for Selected Category */}
            <AnimatePresence>
                {selectedCategory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        {fiqhTopics
                            .filter(c => c.id === selectedCategory)
                            .map(cat => (
                                <div key={cat.id}>
                                    <h2 className="text-xl font-bold text-white mb-4">{cat.category} — বিষয়সমূহ</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {cat.topics.map((topic, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                onClick={() => setSelectedTopic(selectedTopic?.title === topic.title ? null : topic)}
                                                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-all"
                                            >
                                                <h4 className="font-semibold text-white mb-1">{topic.title}</h4>
                                                <p className="text-gray-400 text-sm">{topic.desc}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Topic Detail Modal */}
            <AnimatePresence>
                {selectedTopic && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedTopic(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0f0f2a] border border-emerald-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-emerald-400 mb-3">{selectedTopic.title}</h3>
                            <p className="text-gray-300 leading-relaxed mb-4">{selectedTopic.details}</p>
                            <p className="text-xs text-gray-500 mb-4">📚 সূত্র: হানাফি ফিকহ অনুযায়ী</p>
                            <button
                                onClick={() => setSelectedTopic(null)}
                                className="w-full py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            >
                                বন্ধ করুন
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}