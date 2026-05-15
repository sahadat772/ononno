'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'english-a': {
        id: 'english-a', letter: 'A', word: 'Apple', wordEn: 'Apple', emoji: '🍎',
        color: 'from-violet-400 to-purple-500', lang: 'en-US',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'A for Apple', content: 'A' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Apple', voiceText: 'Apple', content: 'Apple' },
            { id: 'e3', type: 'tap-correct', title: 'Find A!', voiceText: 'Find the letter A', content: 'A', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 'e4', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'A', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 'e5', type: 'letter-puzzle', title: 'Solve the puzzle!', voiceText: 'Pick the correct letter', content: 'A', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 'e6', type: 'trace', title: 'Write A', voiceText: 'Write the letter A', content: 'A' },
            { id: 'e7', type: 'quiz', title: 'Final question!', voiceText: 'Apple starts with which letter?', content: 'A', options: ['B', 'A', 'C', 'D'], correctAnswer: 'A' },
        ],
    },
    'english-b': {
        id: 'english-b', letter: 'B', word: 'Ball', wordEn: 'Ball', emoji: '⚽',
        color: 'from-blue-400 to-cyan-500', lang: 'en-US',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'B for Ball', content: 'B' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Ball', voiceText: 'Ball', content: 'Ball' },
            { id: 'e3', type: 'tap-correct', title: 'Find B!', voiceText: 'Find the letter B', content: 'B', options: ['A', 'B', 'D', 'P'], correctAnswer: 'B' },
            { id: 'e4', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'B', options: ['A', 'B', 'D', 'P'], correctAnswer: 'B' },
            { id: 'e5', type: 'letter-puzzle', title: 'Solve the puzzle!', voiceText: 'Pick the correct letter', content: 'B', options: ['A', 'B', 'D', 'P'], correctAnswer: 'B' },
            { id: 'e6', type: 'trace', title: 'Write B', voiceText: 'Write the letter B', content: 'B' },
            { id: 'e7', type: 'quiz', title: 'Final question!', voiceText: 'Ball starts with which letter?', content: 'B', options: ['A', 'B', 'D', 'P'], correctAnswer: 'B' },
        ],
    },
    'english-c': {
        id: 'english-c', letter: 'C', word: 'Cat', wordEn: 'Cat', emoji: '🐱',
        color: 'from-amber-400 to-orange-500', lang: 'en-US',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'C for Cat', content: 'C' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Cat', voiceText: 'Cat', content: 'Cat' },
            { id: 'e3', type: 'tap-correct', title: 'Find C!', voiceText: 'Find the letter C', content: 'C', options: ['A', 'C', 'G', 'O'], correctAnswer: 'C' },
            { id: 'e4', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'C', options: ['A', 'C', 'G', 'O'], correctAnswer: 'C' },
            { id: 'e5', type: 'letter-puzzle', title: 'Solve the puzzle!', voiceText: 'Pick the correct letter', content: 'C', options: ['A', 'C', 'G', 'O'], correctAnswer: 'C' },
            { id: 'e6', type: 'trace', title: 'Write C', voiceText: 'Write the letter C', content: 'C' },
            { id: 'e7', type: 'quiz', title: 'Final question!', voiceText: 'Cat starts with which letter?', content: 'C', options: ['A', 'G', 'C', 'O'], correctAnswer: 'C' },
        ],
    },
    'english-d': {
        id: 'english-d', letter: 'D', word: 'Dog', wordEn: 'Dog', emoji: '🐶',
        color: 'from-rose-400 to-pink-500', lang: 'en-US',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'D for Dog', content: 'D' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Dog', voiceText: 'Dog', content: 'Dog' },
            { id: 'e3', type: 'tap-correct', title: 'Find D!', voiceText: 'Find the letter D', content: 'D', options: ['B', 'D', 'P', 'Q'], correctAnswer: 'D' },
            { id: 'e4', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'D', options: ['B', 'D', 'P', 'Q'], correctAnswer: 'D' },
            { id: 'e5', type: 'letter-puzzle', title: 'Solve the puzzle!', voiceText: 'Pick the correct letter', content: 'D', options: ['B', 'D', 'P', 'Q'], correctAnswer: 'D' },
            { id: 'e6', type: 'trace', title: 'Write D', voiceText: 'Write the letter D', content: 'D' },
            { id: 'e7', type: 'quiz', title: 'Final question!', voiceText: 'Dog starts with which letter?', content: 'D', options: ['B', 'P', 'D', 'Q'], correctAnswer: 'D' },
        ],
    },
    'english-e': {
        id: 'english-e', letter: 'E', word: 'Egg', wordEn: 'Egg', emoji: '🥚',
        color: 'from-emerald-400 to-teal-500', lang: 'en-US',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'E for Egg', content: 'E' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Egg', voiceText: 'Egg', content: 'Egg' },
            { id: 'e3', type: 'tap-correct', title: 'Find E!', voiceText: 'Find the letter E', content: 'E', options: ['E', 'F', 'B', 'L'], correctAnswer: 'E' },
            { id: 'e4', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'E', options: ['E', 'F', 'B', 'L'], correctAnswer: 'E' },
            { id: 'e5', type: 'letter-puzzle', title: 'Solve the puzzle!', voiceText: 'Pick the correct letter', content: 'E', options: ['E', 'F', 'B', 'L'], correctAnswer: 'E' },
            { id: 'e6', type: 'trace', title: 'Write E', voiceText: 'Write the letter E', content: 'E' },
            { id: 'e7', type: 'quiz', title: 'Final question!', voiceText: 'Egg starts with which letter?', content: 'E', options: ['F', 'E', 'B', 'L'], correctAnswer: 'E' },
        ],
    },
    'english-f': {
        id: 'english-f', letter: 'F', word: 'Fish', wordEn: 'Fish', emoji: '🐠',
        color: 'from-cyan-400 to-blue-500', lang: 'en-US',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'F for Fish', content: 'F' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Fish', voiceText: 'Fish', content: 'Fish' },
            { id: 'e3', type: 'tap-correct', title: 'Find F!', voiceText: 'Find the letter F', content: 'F', options: ['E', 'F', 'P', 'T'], correctAnswer: 'F' },
            { id: 'e4', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'F', options: ['E', 'F', 'P', 'T'], correctAnswer: 'F' },
            { id: 'e5', type: 'letter-puzzle', title: 'Solve the puzzle!', voiceText: 'Pick the correct letter', content: 'F', options: ['E', 'F', 'P', 'T'], correctAnswer: 'F' },
            { id: 'e6', type: 'trace', title: 'Write F', voiceText: 'Write the letter F', content: 'F' },
            { id: 'e7', type: 'quiz', title: 'Final question!', voiceText: 'Fish starts with which letter?', content: 'F', options: ['E', 'P', 'T', 'F'], correctAnswer: 'F' },
        ],
    },
    'english-g': {
        id: 'english-g', letter: 'G', word: 'Goat', wordEn: 'Goat', emoji: '🐐',
        color: 'from-lime-400 to-green-500', lang: 'en-US',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'G for Goat', content: 'G' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Goat', voiceText: 'Goat', content: 'Goat' },
            { id: 'e3', type: 'tap-correct', title: 'Find G!', voiceText: 'Find the letter G', content: 'G', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'G' },
            { id: 'e4', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'G', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'G' },
            { id: 'e5', type: 'letter-puzzle', title: 'Solve the puzzle!', voiceText: 'Pick the correct letter', content: 'G', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'G' },
            { id: 'e6', type: 'trace', title: 'Write G', voiceText: 'Write the letter G', content: 'G' },
            { id: 'e7', type: 'quiz', title: 'Final question!', voiceText: 'Goat starts with which letter?', content: 'G', options: ['C', 'O', 'G', 'Q'], correctAnswer: 'G' },
        ],
    },
}

export default function EnglishLessonPage() {
    const params = useParams()
    const lessonId = params.lessonId as string
    const lesson = lessons[lessonId]

    if (!lesson) return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white">
            <div className="text-center">
                <div className="text-6xl mb-4">😕</div>
                <p className="mb-4">Lesson পাওয়া যায়নি</p>
            </div>
        </div>
    )

    return <LessonEngine lesson={lesson} />
}