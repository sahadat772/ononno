import { ClassLevel, SubscriptionPlan } from '../types/database'

// Class level অনুযায়ী subscription plan
export function getSubscriptionPlanByClass(classLevel: ClassLevel): SubscriptionPlan {
    const planMap: Record<ClassLevel, SubscriptionPlan> = {
        nursery: 'student_99',
        class_1: 'student_99',
        class_2: 'student_99',
        class_3: 'student_199',
        class_4: 'student_199',
        class_5: 'student_199',
        class_6: 'student_299',
        class_7: 'student_299',
        class_8: 'student_299',
        class_9: 'student_399',
        class_10: 'student_399',
        class_11: 'student_499',
        class_12: 'student_499',
        university: 'student_599',
        masters: 'student_599',
    }
    return planMap[classLevel]
}

// Subscription plan এর মূল্য
export function getSubscriptionPrice(plan: SubscriptionPlan): number {
    const priceMap: Record<SubscriptionPlan, number> = {
        free: 0,
        student_99: 99,
        student_199: 199,
        student_299: 299,
        student_399: 399,
        student_499: 499,
        student_599: 599,
        skill_basic: 399,
        skill_pro: 799,
        skill_enterprise: 1999,
        adult_learner: 499,
        family: 0, // dynamic
    }
    return priceMap[plan]
}

// Class level বাংলায়
export function getClassLevelBn(classLevel: ClassLevel): string {
    const map: Record<ClassLevel, string> = {
        nursery: 'নার্সারি',
        class_1: 'শ্রেণী ১',
        class_2: 'শ্রেণী ২',
        class_3: 'শ্রেণী ৩',
        class_4: 'শ্রেণী ৪',
        class_5: 'শ্রেণী ৫',
        class_6: 'শ্রেণী ৬',
        class_7: 'শ্রেণী ৭',
        class_8: 'শ্রেণী ৮',
        class_9: 'শ্রেণী ৯',
        class_10: 'শ্রেণী ১০',
        class_11: 'শ্রেণী ১১',
        class_12: 'শ্রেণী ১২',
        university: 'বিশ্ববিদ্যালয়',
        masters: 'মাস্টার্স',
    }
    return map[classLevel]
}

// Career path available কিনা check
export function isCareerPathAvailable(classLevel: ClassLevel): boolean {
    const availableFrom: ClassLevel[] = [
        'class_9', 'class_10', 'class_11', 'class_12', 'university', 'masters'
    ]
    return availableFrom.includes(classLevel)
}

// Training available কিনা check
export function isTrainingAvailable(classLevel: ClassLevel): boolean {
    const availableFrom: ClassLevel[] = [
        'class_11', 'class_12', 'university', 'masters'
    ]
    return availableFrom.includes(classLevel)
}

// Date format করা
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

// Subscription expired কিনা check
export function isSubscriptionExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
}

// Class level অনুযায়ী age range
export function getAgeRange(classLevel: ClassLevel): string {
    const ageMap: Record<ClassLevel, string> = {
        nursery: '৪-৫ বছর',
        class_1: '৫-৬ বছর',
        class_2: '৬-৭ বছর',
        class_3: '৭-৮ বছর',
        class_4: '৮-৯ বছর',
        class_5: '৯-১০ বছর',
        class_6: '১০-১১ বছর',
        class_7: '১১-১২ বছর',
        class_8: '১২-১৩ বছর',
        class_9: '১৩-১৪ বছর',
        class_10: '১৪-১৫ বছর',
        class_11: '১৫-১৬ বছর',
        class_12: '১৬-১৭ বছর',
        university: '১৮+ বছর',
        masters: '২২+ বছর',
    }
    return ageMap[classLevel]
}