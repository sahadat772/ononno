'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import CreateAccountForm from '@/components/shared/CreateAccountForm'

interface CreateChildClientProps {
    parentId: string
    parentName: string
}

export default function CreateChildClient({
    parentId,
    parentName,
}: CreateChildClientProps) {
    const router = useRouter()

    const handleSuccess = () => {
        router.push('/dashboard/parent')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard/parent')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                        ←
                    </motion.button>
                    <div>
                        <h1 className="text-white font-bold">নতুন Child যোগ করো</h1>
                        <p className="text-white/40 text-xs">{parentName} এর সন্তান</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                <CreateAccountForm
                    role="parent"
                    creatorId={parentId}
                    onSuccess={() => handleSuccess()}
                />
            </div>
        </div>
    )
}