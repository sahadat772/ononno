export type ClassLevel =
    | 'nursery'
    | 'class_3_5'
    | 'class_6_8'
    | 'class_9_10'
    | 'class_11_12'
    | 'university'
    | 'skill_basic'
    | 'skill_pro'
    | 'family'

export type Duration = 'monthly' | 'yearly'

export interface Plan {
    id: string           // যেমন: nursery_monthly
    classLevel: ClassLevel
    duration: Duration
    name: string
    durationName: string
    price: number
    originalPrice?: number
    discountPercent?: number
    durationDays: number
    icon: string
    color: string
    features: string[]
    maxUsers: number
}

// Base monthly prices
const BASE_PRICES: Record<ClassLevel, number> = {
    nursery: 99,
    class_3_5: 199,
    class_6_8: 299,
    class_9_10: 399,
    class_11_12: 499,
    university: 599,
    skill_basic: 399,
    skill_pro: 799,
    family: 999,
}

const CLASS_INFO: Record<ClassLevel, {
    name: string
    icon: string
    color: string
    features: string[]
    maxUsers: number
}> = {
    nursery: {
        name: 'নার্সারি (N-2)',
        icon: '🌱',
        color: 'from-green-400 to-emerald-500',
        features: ['বাংলা বর্ণমালা', 'ইংরেজি ABC', 'আরবি হরফ', 'গণিত', 'ইসলামিক শিক্ষা'],
        maxUsers: 1,
    },
    class_3_5: {
        name: 'শ্রেণী ৩-৫',
        icon: '📚',
        color: 'from-blue-400 to-cyan-500',
        features: ['সব বিষয়', 'AI Tutor', 'Quiz', 'ইসলামিক শিক্ষা', 'Progress tracking'],
        maxUsers: 1,
    },
    class_6_8: {
        name: 'শ্রেণী ৬-৮',
        icon: '📖',
        color: 'from-violet-400 to-purple-500',
        features: ['সব বিষয়', 'AI Tutor', 'Quiz', 'ইসলামিক শিক্ষা', 'Progress tracking'],
        maxUsers: 1,
    },
    class_9_10: {
        name: 'শ্রেণী ৯-১০',
        icon: '🎯',
        color: 'from-amber-400 to-orange-500',
        features: ['সব বিষয়', 'AI Tutor', 'SSC প্রস্তুতি', 'ইসলামিক শিক্ষা', 'Mock Test'],
        maxUsers: 1,
    },
    class_11_12: {
        name: 'শ্রেণী ১১-১২',
        icon: '🏆',
        color: 'from-rose-400 to-pink-500',
        features: ['সব বিষয়', 'AI Tutor', 'HSC প্রস্তুতি', 'ইসলামিক শিক্ষা', 'Mock Test'],
        maxUsers: 1,
    },
    university: {
        name: 'বিশ্ববিদ্যালয়+',
        icon: '🎓',
        color: 'from-indigo-400 to-blue-500',
        features: ['সব বিষয়', 'AI Tutor', 'Admission প্রস্তুতি', 'Career guidance', 'ইসলামিক শিক্ষা'],
        maxUsers: 1,
    },
    skill_basic: {
        name: 'Skill Basic',
        icon: '⚡',
        color: 'from-teal-400 to-cyan-500',
        features: ['Skill courses', 'AI Tutor', 'Certificate', 'ইসলামিক শিক্ষা'],
        maxUsers: 1,
    },
    skill_pro: {
        name: 'Skill Pro',
        icon: '🚀',
        color: 'from-purple-400 to-violet-500',
        features: ['সব Skill courses', 'AI Tutor', 'Certificate', 'Priority support', 'ইসলামিক শিক্ষা'],
        maxUsers: 1,
    },
    family: {
        name: 'পারিবারিক',
        icon: '👨‍👩‍👧',
        color: 'from-emerald-400 to-teal-500',
        features: ['৫ জন student', 'সব class level', 'AI Tutor', 'Parent dashboard', 'ইসলামিক শিক্ষা'],
        maxUsers: 5,
    },
}

// সব plans generate করো
function generatePlans(): Plan[] {
    const plans: Plan[] = []

    const classLevels = Object.keys(BASE_PRICES) as ClassLevel[]

    classLevels.forEach((level) => {
        const info = CLASS_INFO[level]
        const monthlyPrice = BASE_PRICES[level]
        const yearlyPrice = Math.round(monthlyPrice * 12 * 0.7) // ৩০% ছাড়

        // Monthly plan
        plans.push({
            id: `${level}_monthly`,
            classLevel: level,
            duration: 'monthly',
            name: info.name,
            durationName: 'মাসিক',
            price: monthlyPrice,
            durationDays: 30,
            icon: info.icon,
            color: info.color,
            features: info.features,
            maxUsers: info.maxUsers,
        })

        // Yearly plan
        plans.push({
            id: `${level}_yearly`,
            classLevel: level,
            duration: 'yearly',
            name: info.name,
            durationName: 'বার্ষিক',
            price: yearlyPrice,
            originalPrice: monthlyPrice * 12,
            discountPercent: 30,
            durationDays: 365,
            icon: info.icon,
            color: info.color,
            features: [...info.features, '৩০% ছাড়'],
            maxUsers: info.maxUsers,
        })
    })

    return plans
}

export const ALL_PLANS = generatePlans()

// Plan ID দিয়ে plan খোঁজো
export function getPlanById(id: string): Plan | undefined {
    return ALL_PLANS.find(p => p.id === id)
}

// Class level দিয়ে plans খোঁজো
export function getPlansByClass(level: ClassLevel): Plan[] {
    return ALL_PLANS.filter(p => p.classLevel === level)
}