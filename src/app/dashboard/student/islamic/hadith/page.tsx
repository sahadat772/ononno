'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AnalysisPanel from '@/components/ui/AnalysisPanel';
import type { AnalysisResult } from '@/lib/groq';

interface Category {
    id: string;
    title: string;
    hadeeths_count: string;
    parent_id: string | null;
}

interface Hadith {
    id: string;
    title: string;
}

interface Meta {
    current_page: string;
    last_page: number;
    total_items: number;
    per_page: string;
}

const mainCategories = [
    { id: '3', name: 'আকীদা', icon: '☝️', color: 'from-violet-500 to-purple-500', count: '৩৯২' },
    { id: '4', name: 'ফিকহ ও উসূলে ফিকহ', icon: '⚖️', color: 'from-blue-500 to-indigo-500', count: '৮৯৬' },
    { id: '5', name: 'ফযীলত ও শিষ্টাচার', icon: '🌟', color: 'from-amber-500 to-yellow-500', count: '৬৭৬' },
    { id: '6', name: 'দাওয়াহ ও হিসবাহ', icon: '📢', color: 'from-emerald-500 to-teal-500', count: '৮৬' },
    { id: '7', name: 'জীবনী ও ইতিহাস', icon: '📜', color: 'from-rose-500 to-pink-500', count: '১৪৬' },
    { id: '1', name: 'আল-কুরআন সংক্রান্ত', icon: '📖', color: 'from-cyan-500 to-sky-500', count: '৫৮' },
    { id: '2', name: 'হাদিস সংক্রান্ত বিদ্যা', icon: '📚', color: 'from-orange-500 to-red-500', count: '৮' },
];

export default function HadithPage() {
    const [selectedCategory, setSelectedCategory] = useState<typeof mainCategories[0] | null>(null);
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [expandedHadith, setExpandedHadith] = useState<string | null>(null);
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [selectedSubCat, setSelectedSubCat] = useState<Category | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Sub categories fetch
    useEffect(() => {
        if (!selectedCategory) return;
        const fetchSubCats = async () => {
            try {
                const res = await fetch(
                    `https://hadeethenc.com/api/v1/categories/list/?language=bn`
                );
                const data: Category[] = await res.json();
                const subs = data.filter(c => c.parent_id === selectedCategory.id);
                setSubCategories(subs);
            } catch {
                setSubCategories([]);
            }
        };
        fetchSubCats();
    }, [selectedCategory]);

    // Hadiths fetch
    const fetchHadiths = async (categoryId: string, page: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `https://hadeethenc.com/api/v1/hadeeths/list/?language=bn&category_id=${categoryId}&page=${page}&per_page=10`
            );
            const data = await res.json();
            setHadiths(data.data || []);
            setMeta(data.meta || null);
            setCurrentPage(page);
        } catch {
            setError('হাদিস লোড হয়নি। আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (cat: typeof mainCategories[0]) => {
        setSelectedCategory(cat);
        setSelectedSubCat(null);
        setHadiths([]);
        setExpandedHadith(null);
        fetchHadiths(cat.id, 1);
    };

    const handleSubCatSelect = (sub: Category) => {
        setSelectedSubCat(sub);
        setHadiths([]);
        setExpandedHadith(null);
        fetchHadiths(sub.id, 1);
    };

    const handlePageChange = (page: number) => {
        const id = selectedSubCat?.id || selectedCategory?.id;
        if (id) fetchHadiths(id, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getAnalysisContent = () =>
        hadiths.map((h, i) => `হাদিস ${i + 1}: ${h.title}`).join('\n');

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link
                    href="/dashboard/student/islamic"
                    className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-flex items-center gap-2 transition-colors"
                >
                    ← ইসলামিক স্টাডিতে ফিরে যাও
                </Link>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-3xl shadow-lg">
                        📜
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                            হাদিস শরীফ
                        </h1>
                        <p className="text-gray-400 mt-1">বিষয়ভিত্তিক হাদিস • AI বিশ্লেষণ</p>
                    </div>
                </div>
            </motion.div>

            {error && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm flex justify-between">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Category Grid */}
            {!selectedCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mainCategories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            onClick={() => handleCategorySelect(cat)}
                            className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 p-5 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-4 shadow-md`}>
                                {cat.icon}
                            </div>
                            <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors mb-1">
                                {cat.name}
                            </h3>
                            <p className="text-amber-400 text-sm">{cat.count}টি হাদিস</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Sub Categories + Hadith List */}
            {selectedCategory && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
                        <button
                            onClick={() => { setSelectedCategory(null); setHadiths([]); setSubCategories([]); }}
                            className="text-amber-400 hover:text-amber-300 transition-colors"
                        >
                            ← বিষয় তালিকা
                        </button>
                        {selectedSubCat && (
                            <>
                                <span className="text-gray-600">/</span>
                                <button
                                    onClick={() => { setSelectedSubCat(null); fetchHadiths(selectedCategory.id, 1); }}
                                    className="text-amber-400 hover:text-amber-300 transition-colors"
                                >
                                    {selectedCategory.name}
                                </button>
                                <span className="text-gray-600">/</span>
                                <span className="text-gray-300">{selectedSubCat.title}</span>
                            </>
                        )}
                        {!selectedSubCat && (
                            <>
                                <span className="text-gray-600">/</span>
                                <span className="text-gray-300">{selectedCategory.name}</span>
                            </>
                        )}
                    </div>

                    {/* Category Header */}
                    <div className={`rounded-2xl bg-gradient-to-r ${selectedCategory.color} p-px mb-6`}>
                        <div className="rounded-2xl bg-[#0f0f2a] p-5 flex items-center gap-4">
                            <span className="text-4xl">{selectedCategory.icon}</span>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {selectedSubCat ? selectedSubCat.title : selectedCategory.name}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {meta ? `মোট ${meta.total_items}টি হাদিস` : selectedCategory.count + 'টি হাদিস'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sub Categories */}
                    {subCategories.length > 0 && !selectedSubCat && (
                        <div className="mb-6">
                            <p className="text-gray-400 text-sm mb-3">উপ-বিষয়সমূহ:</p>
                            <div className="flex flex-wrap gap-2">
                                {subCategories.map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => handleSubCatSelect(sub)}
                                        className="text-sm px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/30 text-gray-300 hover:text-amber-300 transition-all"
                                    >
                                        {sub.title}
                                        <span className="text-gray-500 ml-1">({sub.hadeeths_count})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-5 animate-pulse h-24" />
                            ))}
                        </div>
                    )}

                    {/* Hadith List */}
                    {!loading && hadiths.length > 0 && (
                        <>
                            <div className="space-y-3">
                                {hadiths.map((hadith, i) => (
                                    <div key={hadith.id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => setExpandedHadith(expandedHadith === hadith.id ? null : hadith.id)}
                                            className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Number */}
                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0 mt-0.5">
                                                    {(currentPage - 1) * 10 + i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-200 text-sm leading-relaxed">
                                                        {hadith.title}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-amber-400/70">
                                                            হাদিস ID: #{hadith.id}
                                                        </span>
                                                        <span className="text-gray-600 text-xs">
                                                            {expandedHadith === hadith.id ? '▲ লুকাও' : '▼ বিস্তারিত'}
                                                        </span>
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedHadith === hadith.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="mt-3 pt-3 border-t border-white/10 space-y-2"
                                                            >
                                                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                                                    <p className="text-xs text-amber-400 font-semibold mb-1">💡 শিক্ষা</p>
                                                                    <p className="text-gray-300 text-xs leading-relaxed">
                                                                        এই হাদিসটি আমাদের দৈনন্দিন জীবনে গুরুত্বপূর্ণ শিক্ষা দেয়। AI বিশ্লেষণ বাটনে ক্লিক করে বিস্তারিত জানুন।
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                                                                        ✓ প্রামাণিক
                                                                    </span>
                                                                    <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                                                        📚 hadeethenc.com
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* প্রতি ৫ হাদিস পর Analysis */}
                                        {(i + 1) % 5 === 0 && (
                                            <AnalysisPanel
                                                label={`হাদিস ${(currentPage - 1) * 10 + i - 3} - ${(currentPage - 1) * 10 + i + 1} এর গভীর বিশ্লেষণ`}
                                                context="মূল শিক্ষা • রাসূল ﷺ এর আদর্শ • বিজ্ঞান • জীবনে প্রয়োগ"
                                                onAnalyze={async (): Promise<AnalysisResult | null> => {
                                                    const chunk = hadiths.slice(i - 4, i + 1);
                                                    const res = await fetch('/api/content-analysis', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            subject: 'হাদিস',
                                                            topic: selectedSubCat?.title || selectedCategory.name,
                                                            content: chunk.map((h, j) => `হাদিস ${j + 1}: ${h.title}`).join('\n'),
                                                            sector: 'islamic',
                                                            level: 'intermediate',
                                                        }),
                                                    });
                                                    const data = await res.json();
                                                    return data.analysis || null;
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* শেষ হাদিস Analysis */}
                                {hadiths.length % 5 !== 0 && (
                                    <AnalysisPanel
                                        label={`এই পেজের সমস্ত হাদিসের বিশ্লেষণ`}
                                        context="মূল শিক্ষা • রাসূল ﷺ এর আদর্শ • বিজ্ঞান • জীবনে প্রয়োগ"
                                        onAnalyze={async (): Promise<AnalysisResult | null> => {
                                            const res = await fetch('/api/content-analysis', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    subject: 'হাদিস',
                                                    topic: selectedSubCat?.title || selectedCategory.name,
                                                    content: getAnalysisContent(),
                                                    sector: 'islamic',
                                                    level: 'intermediate',
                                                }),
                                            });
                                            const data = await res.json();
                                            return data.analysis || null;
                                        }}
                                    />
                                )}
                            </div>

                            {/* Pagination */}
                            {meta && meta.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                                    >
                                        ← আগের
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                                        let page;
                                        if (meta.last_page <= 5) {
                                            page = i + 1;
                                        } else if (currentPage <= 3) {
                                            page = i + 1;
                                        } else if (currentPage >= meta.last_page - 2) {
                                            page = meta.last_page - 4 + i;
                                        } else {
                                            page = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${currentPage === page
                                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                        : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === meta.last_page}
                                        className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                                    >
                                        পরের →
                                    </button>
                                </div>
                            )}

                            {meta && (
                                <p className="text-center text-gray-600 text-xs mt-3">
                                    পেজ {currentPage} / {meta.last_page} • মোট {meta.total_items}টি হাদিস
                                </p>
                            )}
                        </>
                    )}

                    {/* Empty */}
                    {!loading && hadiths.length === 0 && (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-4xl mb-3">📭</p>
                            <p>কোনো হাদিস পাওয়া যায়নি।</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}