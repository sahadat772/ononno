'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ClassLevel, UserRole } from '@/types/database'

export default function RegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student' as UserRole,
        religion: 'muslim',
        class_level: 'class_6' as ClassLevel,
        gender: '',
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const supabase = createClient()

            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                        phone: formData.phone,
                        role: formData.role,
                        religion: formData.religion,
                    },
                },
            })

            if (signUpError) {
                setError(signUpError.message)
                return
            }

            if (data.user) {
                // Profile তৈরি
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone || null,
                    role: formData.role,
                    religion: formData.religion,
                })

                // Student profile তৈরি
                if (formData.role === 'student') {
                    await supabase.from('student_profiles').insert({
                        user_id: data.user.id,
                        class_level: formData.class_level,
                        gender: formData.gender || null,
                    })
                }

                // parent profile তৈরি
                if (formData.role === 'parent') {
                    await supabase.from('parent_profiles').insert({
                        user_id: data.user.id,
                        class_level: formData.class_level,
                        gender: formData.gender || null,
                    })
                }
            }

            router.push('/auth/redirect')
            router.refresh()

        } catch {
            setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-semibold text-green-700">
                        Ononno
                    </Link>
                    <p className="text-gray-500 text-sm mt-2">নতুন অ্যাকাউন্ট তৈরি করো</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {s}
                            </div>
                            {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-green-700' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Step 1 */}
                        {step === 1 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">পুরো নাম</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="তোমার পুরো নাম"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="তোমার ইমেইল"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">পাসওয়ার্ড</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="কমপক্ষে ৬ অক্ষর"
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ফোন নম্বর</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="01XXXXXXXXX"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!formData.full_name || !formData.email || !formData.password) {
                                            setError('সব তথ্য পূরণ করো')
                                            return
                                        }
                                        setError('')
                                        setStep(2)
                                    }}
                                    className="w-full bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
                                >
                                    পরের ধাপ
                                </button>
                            </>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="role">
                                        তুমি কে?
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="student">শিক্ষার্থী</option>
                                        <option value="parent">অভিভাবক</option>
                                        <option value="teacher">শিক্ষক</option>
                                        <option value="skill_learner">Skill Learner</option>
                                        <option value="adult_learner">Adult Learner</option>
                                    </select>
                                </div>

                                {formData.role === 'student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="class_level">
                                            শ্রেণী
                                        </label>
                                        <select
                                            id='class_level'
                                            name="class_level"
                                            value={formData.class_level}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="nursery">নার্সারি</option>
                                            <option value="class_1">শ্রেণী ১</option>
                                            <option value="class_2">শ্রেণী ২</option>
                                            <option value="class_3">শ্রেণী ৩</option>
                                            <option value="class_4">শ্রেণী ৪</option>
                                            <option value="class_5">শ্রেণী ৫</option>
                                            <option value="class_6">শ্রেণী ৬</option>
                                            <option value="class_7">শ্রেণী ৭</option>
                                            <option value="class_8">শ্রেণী ৮</option>
                                            <option value="class_9">শ্রেণী ৯</option>
                                            <option value="class_10">শ্রেণী ১০</option>
                                            <option value="class_11">শ্রেণী ১১</option>
                                            <option value="class_12">শ্রেণী ১২</option>
                                            <option value="university">বিশ্ববিদ্যালয়</option>
                                            <option value="masters">মাস্টার্স</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor='religion'>
                                        ধর্ম
                                    </label>
                                    <select
                                        id='religion'
                                        name="religion"
                                        value={formData.religion}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="muslim">মুসলিম</option>
                                        <option value="hindu">হিন্দু</option>
                                        <option value="christian">খ্রিস্টান</option>
                                        <option value="buddhist">বৌদ্ধ</option>
                                        <option value="other">অন্যান্য</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor='gender'>লিঙ্গ</label>
                                    <select
                                        id='gender'
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">নির্বাচন করো</option>
                                        <option value="male">ছেলে</option>
                                        <option value="female">মেয়ে</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        পেছনে
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করো'}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        আগেই অ্যাকাউন্ট আছে?{' '}
                        <Link href="/login" className="text-green-700 font-medium hover:underline">
                            লগইন করো
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}