import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/shared/LogoutButton'
import Link from 'next/link'


export default async function StudentDashboard() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="text-xl font-semibold text-green-700">Ononno</div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        {profile?.full_name}
                    </span>
                    <LogoutButton />
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        আস-সালামু আলাইকুম, {profile?.full_name} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {studentProfile?.class_level?.replace('_', ' ').toUpperCase()} · আজকের পড়াশোনা শুরু করো
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'আজকের লেসন', value: '০', icon: '📚', color: 'bg-blue-50' },
                        { label: 'ইসলামিক পড়া', value: '০', icon: '🕌', color: 'bg-green-50' },
                        { label: 'Quiz score', value: '০%', icon: '✅', color: 'bg-purple-50' },
                        { label: 'Streak', value: '১ দিন', icon: '🔥', color: 'bg-amber-50' },
                    ].map((stat) => (
                        <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
                            <div className="text-2xl mb-2">{stat.icon}</div>
                            <div className="text-xl font-semibold text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Islamic Study */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">🕌</div>
                            <div>
                                <h2 className="font-semibold text-gray-900 text-sm">ইসলামিক শিক্ষা</h2>
                                <p className="text-xs text-gray-500">বাধ্যতামূলক</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {['কুরআন তিলাওয়াত', 'হাদিস শিক্ষা', 'ফিকহ'].map((item) => (
                                <div key={item} className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-700">{item}</span>
                                    <span className="text-xs text-gray-400">শুরু করো →</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 bg-green-700 text-white py-2 rounded-lg text-sm hover:bg-green-800 transition-colors">
                            পড়া শুরু করো
                        </button>
                    </div>

                    {/* Academic */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">📚</div>
                            <div>
                                <h2 className="font-semibold text-gray-900 text-sm">একাডেমিক</h2>
                                <p className="text-xs text-gray-500">{studentProfile?.class_level?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান'].map((item) => (
                                <div key={item} className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-700">{item}</span>
                                    <span className="text-xs text-gray-400">শুরু করো →</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                            পড়া শুরু করো
                        </button>
                    </div>

                    {/* AI Tutor */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">🤖</div>
                            <div>
                                <h2 className="font-semibold text-gray-900 text-sm">AI শিক্ষক</h2>
                                <p className="text-xs text-gray-500">Groq AI চালিত</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            যেকোনো প্রশ্ন করো। AI তোমার ভাষায় বুঝিয়ে দেবে।
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500">আস-সালামু আলাইকুম! আমি তোমার AI শিক্ষক। আজকে কী পড়তে চাও?</p>
                        </div>
                        
                        <Link href="/dashboard/student/ai-tutor">
                            <button className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                                AI এর সাথে কথা বলো
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Career path — class 9+ */}
                {studentProfile?.class_level && ['class_9', 'class_10', 'class_11', 'class_12', 'university', 'masters'].includes(studentProfile.class_level) && (
                    <div className="mt-6 bg-amber-50 rounded-xl border border-amber-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-gray-900">ক্যারিয়ার পাথ AI</h2>
                                <p className="text-sm text-gray-500 mt-1">তোমার আগ্রহ ও দক্ষতা বিশ্লেষণ করে সেরা ক্যারিয়ার suggest করবে</p>
                            </div>
                            <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors">
                                শুরু করো
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}