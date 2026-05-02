import Link from 'next/link'

export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="text-2xl font-semibold text-green-700">Ononno</div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                        লগইন
                    </Link>
                    <Link href="/register" className="text-sm bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
                        শুরু করো
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-6 py-20 text-center">
                <div className="inline-block bg-green-50 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                    Nursery থেকে Masters পর্যন্ত
                </div>
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
                    শিক্ষায় অনন্য,
                    <br />
                    <span className="text-green-700">AI-চালিত ভবিষ্যৎ গড়ো</span>
                </h1>
                <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    একাডেমিক শিক্ষা, ইসলামিক জ্ঞান, ক্যারিয়ার গাইডেন্স এবং স্কিল ট্রেনিং — সব এক জায়গায়।
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Link href="/register" className="bg-green-700 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-green-800 transition-colors">
                        বিনামূল্যে শুরু করো
                    </Link>
                    <Link href="#features" className="text-gray-600 px-8 py-3 rounded-lg text-base border border-gray-200 hover:border-gray-300 transition-colors">
                        আরো জানো
                    </Link>
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-gray-100 py-12">
                <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: '৪+', label: 'বছর বয়স থেকে' },
                        { value: '৬', label: 'ML ইঞ্জিন' },
                        { value: '১২+', label: 'ট্রেনিং মডিউল' },
                        { value: '৳০', label: 'শুরুতে খরচ' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-3xl font-semibold text-green-700 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="max-w-4xl mx-auto px-6 py-20">
                <h2 className="text-2xl font-semibold text-gray-900 text-center mb-12">
                    একটি platform, সব সমাধান
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: '📖', title: 'ইসলামিক শিক্ষা', desc: 'কুরআন তিলাওয়াত থেকে তাফসির পর্যন্ত। সকল মুসলিম শিক্ষার্থীর জন্য বাধ্যতামূলক।', color: 'bg-green-50' },
                        { icon: '🎓', title: 'একাডেমিক শিক্ষা', desc: 'Nursery থেকে Masters পর্যন্ত বাংলাদেশ কারিকুলাম অনুযায়ী সম্পূর্ণ পাঠ্যক্রম।', color: 'bg-blue-50' },
                        { icon: '🧠', title: 'AI ক্যারিয়ার গাইড', desc: 'তোমার আগ্রহ ও দক্ষতা বিশ্লেষণ করে ML সেরা ক্যারিয়ার path suggest করবে।', color: 'bg-purple-50' },
                        { icon: '💹', title: 'Stock Market Training', desc: 'শেয়ার বাজার থেকে হালাল বিনিয়োগ পর্যন্ত সম্পূর্ণ ট্রেনিং।', color: 'bg-amber-50' },
                        { icon: '💻', title: 'Skill Development', desc: 'Web, App, AI development থেকে Business, Marketing সব ট্রেনিং এক জায়গায়।', color: 'bg-cyan-50' },
                        { icon: '👨‍👩‍👧', title: 'Parent Dashboard', desc: 'সন্তানের একাডেমিক ও ইসলামিক progress একনজরে দেখুন।', color: 'bg-rose-50' },
                    ].map((feature) => (
                        <div key={feature.title} className={`${feature.color} rounded-xl p-6`}>
                            <div className="text-3xl mb-3">{feature.icon}</div>
                            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-green-700 py-16 text-center">
                <h2 className="text-2xl font-semibold text-white mb-4">
                    আজই শুরু করো — সম্পূর্ণ বিনামূল্যে
                </h2>
                <p className="text-green-100 mb-8 text-sm">
                    এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীদের জন্য সর্বদা বিনামূল্যে
                </p>
                <Link href="/register" className="bg-white text-green-700 px-8 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">
                    এখনই রেজিস্ট্রেশন করো
                </Link>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
                © 2026 Ononno
            </footer>
        </main>
    )
}