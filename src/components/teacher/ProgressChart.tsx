'use client'

import { motion } from 'framer-motion'

interface WeeklyData {
    day: string
    lessons: number
    minutes: number
}

interface SubjectData {
    subject: string
    total: number
    completed: number
}

interface ProgressChartProps {
    weeklyData?: WeeklyData[]
    subjectData?: SubjectData[]
    isLoading?: boolean
}

const DEFAULT_WEEKLY: WeeklyData[] = [
    { day: 'শনি', lessons: 0, minutes: 0 },
    { day: 'রবি', lessons: 0, minutes: 0 },
    { day: 'সোম', lessons: 0, minutes: 0 },
    { day: 'মঙ্গল', lessons: 0, minutes: 0 },
    { day: 'বুধ', lessons: 0, minutes: 0 },
    { day: 'বৃহস্পতি', lessons: 0, minutes: 0 },
    { day: 'শুক্র', lessons: 0, minutes: 0 },
]

export default function ProgressChart({
    weeklyData = DEFAULT_WEEKLY,
    subjectData = [],
    isLoading = false,
}: ProgressChartProps) {
    const maxLessons = Math.max(...weeklyData.map((d) => d.lessons), 1)
    const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1)

    if (isLoading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-6" />
                <div className="flex items-end gap-2 h-32">
                    {[60, 80, 40, 90, 50, 70, 30].map((height, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-white/10 rounded-t-lg"
                            style={{ height: `${height}%` }}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Weekly Lessons Bar Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-1">সাপ্তাহিক Lesson</h3>
                <p className="text-white/40 text-xs mb-6">গত ৭ দিনের অগ্রগতি</p>

                <div className="flex items-end gap-2 h-32">
                    {weeklyData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-white/40 text-xs">{data.lessons}</span>
                            <div className="w-full flex items-end" style={{ height: '96px' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: `${(data.lessons / maxLessons) * 100}%`,
                                    }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="w-full bg-linear-to-t from-violet-600 to-purple-400 rounded-t-lg min-height: 4px;"
                                />
                            </div>
                            <span className="text-white/40 text-xs">{data.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Minutes Bar Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-1">সাপ্তাহিক সময়</h3>
                <p className="text-white/40 text-xs mb-6">মিনিট হিসেবে</p>

                <div className="flex items-end gap-2 h-32">
                    {weeklyData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-white/40 text-xs">{data.minutes}</span>
                            <div className="w-full flex items-end" style={{ height: '96px' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: `${(data.minutes / maxMinutes) * 100}%`,
                                    }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="w-full bg-linear-to-t from-purple-600 to-pink-400 rounded-t-lg min-height: 4px;"
                                />
                            </div>
                            <span className="text-white/40 text-xs">{data.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subject Breakdown */}
            {subjectData.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-1">বিষয়ভিত্তিক অগ্রগতি</h3>
                    <p className="text-white/40 text-xs mb-6">প্রতিটি বিষয়ে কতটুকু শেখা হয়েছে</p>

                    <div className="space-y-4">
                        {subjectData.map((subject, index) => {
                            const percent =
                                subject.total > 0
                                    ? Math.round((subject.completed / subject.total) * 100)
                                    : 0

                            return (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white/70">{subject.subject}</span>
                                        <span className="text-white/40">
                                            {subject.completed}/{subject.total} ({percent}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                            className="h-full bg-linear-to-r from-violet-600 to-purple-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}