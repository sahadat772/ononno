'use client'

import { useState } from 'react'

interface WeaknessAnalysis {
    weak_topics: string[]
    strong_topics: string[]
    weak_subjects: string[]
    strong_subjects: string[]
    ai_suggestion: string
    predicted_next_score: string
    study_plan: string[]
    priority_lessons: string[]
}

interface LearningPath {
    today_plan: {
        type: string
        title: string
        description: string
        priority: string
        estimated_minutes: number
    }[]
    ai_analysis: string
    motivational_message: string
    total_study_minutes: number
}

interface PerformancePrediction {
    predicted_score: number
    confidence_percent: number
    grade: string
    weak_areas: string[]
    suggestion: string
    study_recommendation: string
    improvement_tips: string[]
}

export function useML(studentId: string) {
    const [weaknessLoading, setWeaknessLoading] = useState(false)
    const [pathLoading, setPathLoading] = useState(false)
    const [predictionLoading, setPredictionLoading] = useState(false)

    const [weakness, setWeakness] = useState<WeaknessAnalysis | null>(null)
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
    const [prediction, setPrediction] = useState<PerformancePrediction | null>(null)

    const [error, setError] = useState<string | null>(null)

    // Weakness Analysis
    async function analyzeWeakness() {
        setWeaknessLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ml/analyze-weakness', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: studentId }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Weakness analysis failed')
                return null
            }
            setWeakness(data.analysis)
            return data.analysis
        } catch {
            setError('Server error')
            return null
        } finally {
            setWeaknessLoading(false)
        }
    }

    // Learning Path
    async function fetchLearningPath() {
        setPathLoading(true)
        setError(null)
        try {
            const res = await fetch(
                `/api/ml/learning-path?student_id=${studentId}`,
                { method: 'GET' }
            )
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Learning path failed')
                return null
            }
            const path = data.learning_path
            setLearningPath({
                today_plan: path.today_plan || path.recommended_lessons || [],
                ai_analysis: path.ai_analysis || '',
                motivational_message: path.motivational_message || '',
                total_study_minutes: path.total_study_minutes || 0,
            })
            return path
        } catch {
            setError('Server error')
            return null
        } finally {
            setPathLoading(false)
        }
    }

    // Performance Prediction
    async function predictPerformance(subject?: string) {
        setPredictionLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ml/predict-performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: studentId, subject }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Prediction failed')
                return null
            }
            setPrediction(data.prediction)
            return data.prediction
        } catch {
            setError('Server error')
            return null
        } finally {
            setPredictionLoading(false)
        }
    }

    return {
        // Data
        weakness,
        learningPath,
        prediction,
        error,

        // Loading states
        weaknessLoading,
        pathLoading,
        predictionLoading,

        // Functions
        analyzeWeakness,
        fetchLearningPath,
        predictPerformance,
    }
}