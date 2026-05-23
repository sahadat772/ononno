'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const categories = [
    { id: 'orphan', label: '🤲 এতিম', desc: 'পিতা বা মাতা বা উভয়কে হারিয়েছি' },
    { id: 'poor', label: '💙 দরিদ্র', desc: 'আর্থিক সংকটে পড়াশোনা করা কঠিন' },
    { id: 'disabled', label: '♿ প্রতিবন্ধী', desc: 'শারীরিক বা মানসিক প্রতিবন্ধকতা আছে' },
    { id: 'other', label: '📋 অন্যান্য', desc: 'অন্য কোনো কারণ' },
]

const districts = [
    'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট',
    'রংপুর', 'ময়মনসিংহ', 'কুমিল্লা', 'গাজীপুর', 'নারায়ণগঞ্জ',
    'টাঙ্গাইল', 'যশোর', 'দিনাজপুর', 'বগুড়া', 'পাবনা', 'নোয়াখালী',
    'ফেনী', 'লক্ষ্মীপুর', 'ব্রাহ্মণবাড়িয়া', 'হবিগঞ্জ', 'মৌলভীবাজার',
    'সুনামগঞ্জ', 'নেত্রকোণা', 'কিশোরগঞ্জ', 'মানিকগঞ্জ', 'মুন্সীগঞ্জ',
    'শরীয়তপুর', 'মাদারীপুর', 'গোপালগঞ্জ', 'ফরিদপুর', 'রাজবাড়ী',
    'অন্যান্য'
]

const classLevels = [
    'নার্সারি', 'কেজি', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12', 'বিশ্ববিদ্যালয়', 'অন্যান্য'
]

export default function FreeAccessPage() {
    const router = useRouter()
    const [step, setStep] = useState<'form' | 'success'>('form')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentStep, setCurrentStep] = useState(1)

    // Form data
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [reason, setReason] = useState('')
    const [age, setAge] = useState('')
    const [district, setDistrict] = useState('')
    const [classLevel, setClassLevel] = useState('')
    const [fatherName, setFatherName] = useState('')
    const [fatherOccupation, setFatherOccupation] = useState('')
    const [motherName, setMotherName] = useState('')
    const [motherOccupation, setMotherOccupation] = useState('')
    const [monthlyIncome, setMonthlyIncome] = useState('')
    const [familyMembers, setFamilyMembers] = useState('')
    const [chairmanCertificate, setChairmanCertificate] = useState('')
    const [schoolName, setSchoolName] = useState('')
    const [studentId, setStudentId] = useState('')
    const [disabilityCertificate, setDisabilityCertificate] = useState<File | null>(null)
    const [disabilityPhoto, setDisabilityPhoto] = useState<File | null>(null)

    async function uploadFile(file: File, path: string): Promise<string | null> {
        const supabase = createClient()
        const { data, error } = await supabase.storage
            .from('free-access-docs')
            .upload(path, file, { upsert: true })
        if (error) return null
        return data.path
    }

    function validateStep1(): boolean {
        if (!selectedCategory) { setError('বিভাগ বেছে নাও'); return false }
        if (reason.trim().length < 20) { setError('অন্তত ২০ অক্ষরে তোমার পরিস্থিতি বর্ণনা করো'); return false }
        if (!age || parseInt(age) < 4 || parseInt(age) > 40) { setError('সঠিক বয়স দাও'); return false }
        if (!district) { setError('জেলা বেছে নাও'); return false }
        if (!classLevel) { setError('শ্রেণী বেছে নাও'); return false }
        return true
    }

    function validateStep2(): boolean {
        if (!fatherName.trim()) { setError('পিতার নাম দাও'); return false }
        if (!fatherOccupation.trim()) { setError('পিতার পেশা দাও'); return false }
        if (!motherName.trim()) { setError('মাতার নাম দাও'); return false }
        if (!motherOccupation.trim()) { setError('মাতার পেশা দাও'); return false }
        if (!monthlyIncome) { setError('মাসিক আয় দাও'); return false }
        if (!familyMembers || parseInt(familyMembers) < 1) { setError('পরিবারের সদস্য সংখ্যা দাও'); return false }
        return true
    }

    function validateStep3(): boolean {
        if (!schoolName.trim()) { setError('স্কুলের নাম দাও'); return false }
        if (selectedCategory === 'disabled' && !disabilityPhoto) {
            setError('প্রতিবন্ধী হলে ছবি আপলোড করো'); return false
        }
        return true
    }

    function nextStep() {
        setError(null)
        if (currentStep === 1 && !validateStep1()) return
        if (currentStep === 2 && !validateStep2()) return
        setCurrentStep(prev => prev + 1)
    }

    async function handleSubmit() {
        setError(null)
        if (!validateStep3()) return

        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/free-access')
                return
            }

            // আগে আবেদন আছে কিনা check
            const { data: existingList } = await supabase
                .from('free_access_requests')
                .select('id, status')
                .eq('user_id', user.id)
                .limit(1)

            const existing = existingList?.[0] || null

            if (existing) {
                if (existing.status === 'pending') {
                    setError('তোমার আবেদন ইতোমধ্যে জমা আছে — অপেক্ষা করো')
                } else if (existing.status === 'approved') {
                    setError('তোমার আবেদন ইতোমধ্যে অনুমোদিত হয়েছে!')
                } else {
                    setError('তোমার আগের আবেদন প্রত্যাখ্যাত হয়েছে। যোগাযোগ করো।')
                }
                return
            }

            // File upload
            let certificateUrl = null
            let photoUrl = null

            if (disabilityCertificate) {
                certificateUrl = await uploadFile(
                    disabilityCertificate,
                    `${user.id}/certificate_${Date.now()}`
                )
            }

            if (disabilityPhoto) {
                photoUrl = await uploadFile(
                    disabilityPhoto,
                    `${user.id}/photo_${Date.now()}`
                )
            }

            // Submit
            const { error: dbError } = await supabase
                .from('free_access_requests')
                .insert({
                    user_id: user.id,
                    category: selectedCategory,
                    reason: reason.trim(),
                    age: parseInt(age),
                    district,
                    class_level: classLevel,
                    father_name: fatherName.trim(),
                    father_occupation: fatherOccupation.trim(),
                    mother_name: motherName.trim(),
                    mother_occupation: motherOccupation.trim(),
                    monthly_income: monthlyIncome,
                    family_members: parseInt(familyMembers),
                    chairman_certificate: chairmanCertificate.trim(),
                    school_name: schoolName.trim(),
                    student_id: studentId.trim(),
                    disability_certificate_url: certificateUrl,
                    disability_photo_url: photoUrl,
                    status: 'pending',
                    reason_type: selectedCategory,
                })

            if (dbError) {
                setError('কিছু সমস্যা হয়েছে, আবার চেষ্টা করো')
                return
            }

            setStep('success')

        } catch {
            setError('Server এ সমস্যা হয়েছে')
        } finally {
            setLoading(false)
        }
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[#07071a] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-5xl">🤲</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">
                        আবেদন জমা হয়েছে!
                    </h1>
                    <p className="text-white/50 mb-8">
                        আমরা তোমার আবেদন পেয়েছি। ১-২ কর্মদিবসের মধ্যে
                        যোগাযোগ করা হবে। ইনশাআল্লাহ।
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/dashboard/student"
                            className="block w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium transition-all"
                        >
                            Dashboard এ যাও
                        </Link>
                        <Link
                            href="/"
                            className="block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 transition-all"
                        >
                            Home এ যাও
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#07071a] text-white">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.06] bg-[#07071a]/80 backdrop-blur-2xl">
                <div className="max-w-6xl mx-auto h-full px-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-base font-black">
                            অ
                        </div>
                        <span className="font-black text-white text-xl">অনন্য</span>
                    </Link>
                    <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                        লগইন →
                    </Link>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-5 pt-28 pb-16">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🤲</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">
                        বিনামূল্যে শিক্ষার আবেদন
                    </h1>
                    <p className="text-gray-400 text-sm">
                        এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীদের জন্য সম্পূর্ণ বিনামূল্যে
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep >= s
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/10 text-white/40'
                                }`}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`w-12 h-0.5 transition-all ${currentStep > s ? 'bg-emerald-500' : 'bg-white/10'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 md:p-8"
                >

                    {/* Step 1 — ব্যক্তিগত তথ্য */}
                    {currentStep === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-white font-bold text-lg mb-4">
                                ধাপ ১ — ব্যক্তিগত তথ্য
                            </h2>

                            {/* Category */}
                            <div>
                                <p className="text-white/70 text-sm mb-2 font-medium">বিভাগ *</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedCategory === cat.id
                                                ? 'bg-emerald-500/20 border-emerald-500/40'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <p className="text-white font-medium text-sm">{cat.label}</p>
                                            <p className="text-white/40 text-xs mt-0.5">{cat.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Age */}
                            <div>
                                <p className="text-white/70 text-sm mb-2 font-medium">বয়স *</p>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="তোমার বয়স"
                                    min="4" max="40"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            {/* District */}
                            <div>
                                <p className="text-white/70 text-sm mb-2 font-medium">জেলা *</p>
                                <select
                                    value={district}
                                    aria-label="জেলা বেছে নাও"
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                >
                                    <option value="" className="bg-[#0a0a1a]">জেলা বেছে নাও</option>
                                    {districts.map((d) => (
                                        <option key={d} value={d} className="bg-[#0a0a1a]">{d}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Class Level */}
                            <div>
                                <p className="text-white/70 text-sm mb-2 font-medium">শ্রেণী *</p>
                                <select
                                    value={classLevel}
                                    aria-label="শ্রেণী বেছে নাও"
                                    onChange={(e) => setClassLevel(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                >
                                    <option value="" className="bg-[#0a0a1a]">শ্রেণী বেছে নাও</option>
                                    {classLevels.map((c) => (
                                        <option key={c} value={c} className="bg-[#0a0a1a]">{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Reason */}
                            <div>
                                <p className="text-white/70 text-sm mb-2 font-medium">
                                    তোমার পরিস্থিতি বর্ণনা করো *
                                </p>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="কেন বিনামূল্যে পড়তে চাও সংক্ষেপে লেখো..."
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                />
                                <p className="text-white/30 text-xs mt-1">{reason.length} অক্ষর (কমপক্ষে ২০)</p>
                            </div>
                        </div>
                    )}

                    {/* Step 2 — পরিবারের তথ্য */}
                    {currentStep === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-white font-bold text-lg mb-4">
                                ধাপ ২ — পরিবারের তথ্য
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-white/70 text-sm mb-2 font-medium">পিতার নাম *</p>
                                    <input
                                        type="text"
                                        value={fatherName}
                                        onChange={(e) => setFatherName(e.target.value)}
                                        placeholder="পিতার নাম"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm mb-2 font-medium">পিতার পেশা *</p>
                                    <input
                                        type="text"
                                        value={fatherOccupation}
                                        onChange={(e) => setFatherOccupation(e.target.value)}
                                        placeholder="যেমন: কৃষক, ব্যবসায়ী"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-white/70 text-sm mb-2 font-medium">মাতার নাম *</p>
                                    <input
                                        type="text"
                                        value={motherName}
                                        onChange={(e) => setMotherName(e.target.value)}
                                        placeholder="মাতার নাম"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm mb-2 font-medium">মাতার পেশা *</p>
                                    <input
                                        type="text"
                                        value={motherOccupation}
                                        onChange={(e) => setMotherOccupation(e.target.value)}
                                        placeholder="যেমন: গৃহিণী"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-white/70 text-sm mb-2 font-medium">মাসিক আয় *</p>
                                    <select
                                        value={monthlyIncome}
                                        aria-label="মাসিক ইনকাম বেছে নাও"
                                        onChange={(e) => setMonthlyIncome(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                    >
                                        <option value="" className="bg-[#0a0a1a]">আয় বেছে নাও</option>
                                        <option value="0" className="bg-[#0a0a1a]">কোনো আয় নেই</option>
                                        <option value="0-5000" className="bg-[#0a0a1a]">৳০ — ৳৫,০০০</option>
                                        <option value="5000-10000" className="bg-[#0a0a1a]">৳৫,০০০ — ৳১০,০০০</option>
                                        <option value="10000-20000" className="bg-[#0a0a1a]">৳১০,০০০ — ৳২০,০০০</option>
                                        <option value="20000+" className="bg-[#0a0a1a]">৳২০,০০০+</option>
                                    </select>
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm mb-2 font-medium">পরিবারের সদস্য *</p>
                                    <input
                                        type="number"
                                        value={familyMembers}
                                        onChange={(e) => setFamilyMembers(e.target.value)}
                                        placeholder="সংখ্যা"
                                        min="1" max="20"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3 — প্রমাণ ও নথি */}
                    {currentStep === 3 && (
                        <div className="space-y-5">
                            <h2 className="text-white font-bold text-lg mb-4">
                                ধাপ ৩ — প্রমাণ ও নথি
                            </h2>

                            <div>
                                <p className="text-white/70 text-sm mb-2 font-medium">স্কুল/কলেজের নাম *</p>
                                <input
                                    type="text"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    placeholder="তোমার স্কুল বা কলেজের নাম"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            <div>
                                <p className="text-white/70 text-sm mb-2 font-medium">Student ID (যদি থাকে)</p>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    placeholder="Student ID নম্বর"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            <div>
                                <p className="text-white/70 text-sm mb-2 font-medium">
                                    চেয়ারম্যান/কাউন্সিলর সনদ নম্বর (যদি থাকে)
                                </p>
                                <input
                                    type="text"
                                    value={chairmanCertificate}
                                    onChange={(e) => setChairmanCertificate(e.target.value)}
                                    placeholder="সনদ নম্বর"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            {/* Disability files */}
                            {selectedCategory === 'disabled' && (
                                <>
                                    <div>
                                        <p className="text-white/70 text-sm mb-2 font-medium">
                                            প্রতিবন্ধী সনদ (PDF/Image) *
                                        </p>
                                        <input
                                            type="file"
                                            aria-label="প্রতিবন্ধী সনদ আপলোড করো"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setDisabilityCertificate(e.target.files?.[0] || null)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 focus:outline-none transition-colors file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-sm cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-sm mb-2 font-medium">
                                            তোমার সাম্প্রতিক ছবি *
                                        </p>
                                        <input
                                            type="file"
                                            aria-label="তোমার সাম্প্রতিক ছবি আপলোড করো"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={(e) => setDisabilityPhoto(e.target.files?.[0] || null)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 focus:outline-none transition-colors file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-sm cursor-pointer"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                                <p className="text-amber-400 text-xs">
                                    ⚠️ মিথ্যা তথ্য দিলে আবেদন বাতিল হবে এবং account suspend হতে পারে।
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                        {currentStep > 1 && (
                            <button
                                onClick={() => { setError(null); setCurrentStep(prev => prev - 1) }}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 font-medium transition-all"
                            >
                                ← আগে
                            </button>
                        )}
                        {currentStep < 3 ? (
                            <button
                                onClick={nextStep}
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold transition-all"
                            >
                                পরে →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                            >
                                {loading ? 'জমা দেওয়া হচ্ছে...' : 'আবেদন জমা দাও 🤲'}
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Info */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                        { icon: '⏳', title: '১-২ দিন', desc: 'Review সময়' },
                        { icon: '✅', title: '১০০%', desc: 'বিনামূল্যে' },
                        { icon: '🔒', title: 'Private', desc: 'তথ্য সুরক্ষিত' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">{item.icon}</div>
                            <p className="text-white font-bold text-sm">{item.title}</p>
                            <p className="text-white/40 text-xs">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}