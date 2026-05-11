'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props {
    profile: Record<string, string> | null
    role: 'student' | 'parent' | 'admin' | 'teacher' | 'adult'
}

const roleConfig = {
    student: {
        label: '🎓 শিক্ষার্থী',
        color: 'from-blue-500 to-cyan-500',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        backHref: '/dashboard/student',
        backLabel: 'Student Dashboard',
    },
    parent: {
        label: '👨‍👩‍👧 অভিভাবক',
        color: 'from-purple-500 to-violet-500',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        backHref: '/dashboard/parent',
        backLabel: 'Parent Dashboard',
    },
    admin: {
        label: '⚙️ অ্যাডমিন',
        color: 'from-red-500 to-rose-500',
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
        backHref: '/dashboard/admin',
        backLabel: 'Admin Dashboard',
    },
    teacher: {
        label: '👨‍🏫 শিক্ষক',
        color: 'from-emerald-500 to-teal-500',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        backHref: '/dashboard/teacher',
        backLabel: 'Teacher Dashboard',
    },
    adult: {
        label: '👤 প্রাপ্তবয়স্ক',
        color: 'from-amber-500 to-orange-500',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        backHref: '/dashboard/student',
        backLabel: 'Dashboard',
    },
}

export default function ProfilePage({ profile, role }: Props) {
    const config = roleConfig[role]
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [editing, setEditing] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        bio: profile?.bio || '',
        date_of_birth: profile?.date_of_birth || '',
    })

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // File size check (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            setError('ছবির size ২MB এর বেশি হবে না।')
            return
        }

        setUploading(true)
        setError('')

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/avatar.${fileExt}`

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update profile
            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            setAvatarUrl(publicUrl + '?t=' + Date.now())
            setSuccess('ছবি সফলভাবে আপলোড হয়েছে!')
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('ছবি আপলোড হয়নি। আবার চেষ্টা করো।')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    bio: formData.bio,
                    date_of_birth: formData.date_of_birth || null,
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setSuccess('প্রোফাইল সফলভাবে আপডেট হয়েছে!')
            setEditing(false)
            setTimeout(() => {
                setSuccess('')
                router.refresh()
            }, 2000)
        } catch {
            setError('আপডেট হয়নি। আবার চেষ্টা করো।')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <button
                    onClick={() => router.push(config.backHref)}
                    className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-2 transition-colors"
                >
                    ← {config.backLabel} এ ফিরে যাও
                </button>

                <div className="flex items-center gap-4 mt-2">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl shadow-lg`}>
                        👤
                    </div>
                    <div>
                        <h1 className={`text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                            আমার প্রোফাইল
                        </h1>
                        <p className="text-gray-400 mt-1">{config.label}</p>
                    </div>
                </div>
            </motion.div>

            {/* Success/Error */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400 text-sm"
                    >
                        ✅ {success}
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm flex justify-between"
                    >
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError('')}>✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left — Avatar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-1"
                >
                    <div className={`rounded-2xl border ${config.border} ${config.bg} p-6 text-center`}>
                        {/* Avatar */}
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mx-auto shadow-xl">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center text-5xl font-bold text-white`}>
                                        {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>

                            {/* Upload button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                            >
                                {uploading ? (
                                    <span className="animate-spin text-sm">⚙️</span>
                                ) : (
                                    <span className="text-sm">📷</span>
                                )}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">
                            {profile?.full_name}
                        </h2>
                        <p className="text-gray-400 text-sm mb-3">{profile?.email}</p>
                        <span className={`inline-block text-sm px-3 py-1 rounded-full border ${config.border} ${config.bg} text-white`}>
                            {config.label}
                        </span>

                        <p className="text-xs text-gray-500 mt-4">
                            📷 ছবি click করে পরিবর্তন করো
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            সর্বোচ্চ ২MB, JPG/PNG
                        </p>

                        {/* Quick Info */}
                        <div className="mt-6 space-y-3 text-left">
                            {[
                                { label: 'যোগ দিয়েছেন', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('bn-BD') : 'N/A', icon: '📅' },
                                { label: 'ফোন', value: profile?.phone || 'যোগ করা হয়নি', icon: '📞' },
                                { label: 'ঠিকানা', value: profile?.address || 'যোগ করা হয়নি', icon: '📍' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-sm">{item.icon}</span>
                                    <div>
                                        <p className="text-xs text-gray-500">{item.label}</p>
                                        <p className="text-sm text-white">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right — Profile Details */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-2 space-y-4"
                >
                    {/* Edit Form */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white text-lg">ব্যক্তিগত তথ্য</h3>
                            <button
                                onClick={() => editing ? handleSave() : setEditing(true)}
                                disabled={saving}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${editing
                                        ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                                        : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                {saving ? '⏳ সংরক্ষণ হচ্ছে...' : editing ? '✅ সংরক্ষণ করো' : '✏️ সম্পাদনা করো'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">পূর্ণ নাম</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors"
                                    />
                                ) : (
                                    <p className="bg-white/5 rounded-xl px-4 py-3 text-white">{formData.full_name || 'N/A'}</p>
                                )}
                            </div>

                            {/* Email — readonly */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">ইমেইল</label>
                                <p className="bg-white/5 rounded-xl px-4 py-3 text-gray-400">{profile?.email}</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">ফোন নম্বর</label>
                                {editing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="০১XXXXXXXXX"
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors placeholder-gray-600"
                                    />
                                ) : (
                                    <p className="bg-white/5 rounded-xl px-4 py-3 text-white">{formData.phone || 'যোগ করা হয়নি'}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">জন্ম তারিখ</label>
                                {editing ? (
                                    <input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors"
                                    />
                                ) : (
                                    <p className="bg-white/5 rounded-xl px-4 py-3 text-white">
                                        {formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString('bn-BD') : 'যোগ করা হয়নি'}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-400 mb-1 block">ঠিকানা</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="জেলা, উপজেলা, গ্রাম"
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors placeholder-gray-600"
                                    />
                                ) : (
                                    <p className="bg-white/5 rounded-xl px-4 py-3 text-white">{formData.address || 'যোগ করা হয়নি'}</p>
                                )}
                            </div>

                            {/* Bio */}
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-400 mb-1 block">নিজের সম্পর্কে</label>
                                {editing ? (
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="নিজের সম্পর্কে কিছু লিখুন..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors placeholder-gray-600 resize-none"
                                    />
                                ) : (
                                    <p className="bg-white/5 rounded-xl px-4 py-3 text-white min-h-[80px]">
                                        {formData.bio || 'কিছু লেখা হয়নি'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {editing && (
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => { setEditing(false); setError('') }}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all text-sm"
                                >
                                    বাতিল
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${config.color} text-white font-semibold transition-all text-sm disabled:opacity-50`}
                                >
                                    {saving ? '⏳ সংরক্ষণ হচ্ছে...' : '✅ সংরক্ষণ করো'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Account Info */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h3 className="font-bold text-white text-lg mb-4">অ্যাকাউন্ট তথ্য</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { label: 'User ID', value: profile?.id?.slice(0, 8) + '...', icon: '🔑' },
                                { label: 'Role', value: config.label, icon: '👤' },
                                { label: 'Status', value: '🟢 সক্রিয়', icon: '📊' },
                                { label: 'যোগ দিয়েছেন', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('bn-BD') : 'N/A', icon: '📅' },
                                { label: 'শেষ login', value: 'আজ', icon: '🕐' },
                                { label: 'Platform', value: 'Ononno v1.0', icon: '🚀' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-1">{item.icon} {item.label}</p>
                                    <p className="text-sm text-white font-semibold">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                        <h3 className="font-bold text-red-400 text-lg mb-3">⚠️ বিপদজনক অঞ্চল</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            এই কাজগুলো পূর্বাবস্থায় ফেরানো যাবে না।
                        </p>
                        <button className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-semibold">
                            🗑️ অ্যাকাউন্ট মুছে ফেলো
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}