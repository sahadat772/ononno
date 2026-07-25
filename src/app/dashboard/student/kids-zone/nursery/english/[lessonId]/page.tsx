'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'english-a': {
        id: 'english-a',
        letter: 'A',
        word: 'Apple',
        wordEn: 'Apple',
        emoji: '🍎',
        color: 'from-violet-400 to-purple-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: 'Meet Apple! 🍎',
                voiceText: 'Hello little friend! This is an Apple. Apple starts with the letter A.',
                content: '🍎 Apple'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'Listen & Repeat',
                voiceText: 'A... Apple. Say with me. A... Apple.',
                content: 'A'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'Say it loudly!',
                voiceText: 'A for Apple!',
                content: 'A'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'Where is A?',
                voiceText: 'Can you find the letter A?',
                content: '🔍',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'A'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'Pop A!',
                voiceText: 'Pop the bubble with letter A.',
                content: '🫧',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'A'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'Find the first letter',
                voiceText: 'Apple starts with which letter?',
                content: '🍎 Apple',
                options: ['A', 'B', 'P', 'E'],
                correctAnswer: 'A'
            },

            {
                id: 'e7',
                type: 'word-builder',
                title: 'Build Apple',
                voiceText: 'Let&s build the word Apple.',
                content: 'Apple',
                options: ['A', 'p', 'p', 'l', 'e'],
                correctAnswer: 'Apple'
            },

            {
                id: 'e8',
                type: 'matching',
                title: 'Match Together',
                voiceText: 'Match the correct pair.',
                content: 'A',
                options: [
                    'A-Apple',
                    'B-Ball',
                    'C-Cat',
                    'D-Dog'
                ],
                correctAnswer: 'A'
            },

            {
                id: 'e9',
                type: 'trace',
                title: 'Let&s Write A',
                voiceText: 'Now write the letter A.',
                content: 'A'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: 'Final Challenge',
                voiceText: 'Apple starts with which letter?',
                content: '🍎',
                options: ['B', 'A', 'C', 'D'],
                correctAnswer: 'A'
            }

        ]
    },
    'english-b': {
        id: 'english-b',
        letter: 'B',
        word: 'Ball',
        wordEn: 'Ball',
        emoji: '⚽',
        color: 'from-sky-400 to-blue-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'Meet Ball! ⚽',
                voiceText: 'Hello little friend! This is a Ball. Ball starts with the letter B.',
                content: '⚽ Ball'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'Listen & Repeat',
                voiceText: 'B... Ball. Say with me. B... Ball.',
                content: 'B'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'Say it loudly!',
                voiceText: 'B for Ball!',
                content: 'B'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: 'Where is B?',
                voiceText: 'Can you find the letter B?',
                content: '🔍',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'B'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'Pop B!',
                voiceText: 'Pop the bubble with letter B.',
                content: '🫧',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'B'
            },
            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'Find the first letter',
                voiceText: 'Ball starts with which letter?',
                content: '⚽ Ball',
                options: ['B', 'A', 'C', 'D'],
                correctAnswer: 'B'
            },
            {
                id: 'e7',
                type: 'word-builder',
                title: 'Build Ball',
                voiceText: 'Let&s build the word Ball.',
            content: 'Ball',
                options: ['B', 'a', 'l', 'l'],
                correctAnswer: 'Ball'
            },
            {
                id: 'e8',
                type: 'matching',
                title: 'Match Together',
                voiceText: 'Match the correct pair.',
                content: 'B',
                options: ['A-Apple', 'B-Ball', 'C-Cat', 'D-Dog'],
                correctAnswer: 'B'
            },
            {
                id: 'e9',
                type: 'trace',
                title: 'Let&s Write B',
            voiceText: 'Now write the letter B.',
                content: 'B'
            },
            {
                id: 'e10',
                type: 'quiz',
                title: 'Final Challenge',
                voiceText: 'Ball starts with which letter?',
                content: '⚽',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'B'
            }
        ]
    },

    'english-c': {
        id: 'english-c',
        letter: 'C',
        word: 'Cat',
        wordEn: 'Cat',
        emoji: '🐱',
        color: 'from-orange-400 to-amber-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'Meet Cat! 🐱',
                voiceText: 'Hello little friend! This is a Cat. Cat starts with the letter C.',
                content: '🐱 Cat'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'Listen & Repeat',
                voiceText: 'C... Cat. Say with me. C... Cat.',
                content: 'C'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'Say it loudly!',
                voiceText: 'C for Cat!',
                content: 'C'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: 'Where is C?',
                voiceText: 'Can you find the letter C?',
                content: '🔍',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'C'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'Pop C!',
                voiceText: 'Pop the bubble with letter C.',
                content: '🫧',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'C'
            },
            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'Find the first letter',
                voiceText: 'Cat starts with which letter?',
                content: '🐱 Cat',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'C'
            },
            {
                id: 'e7',
                type: 'word-builder',
                title: 'Build Cat',
                voiceText: 'Let&s build the word Cat.',
            content: 'Cat',
                options: ['C', 'a', 't'],
                correctAnswer: 'Cat'
            },
            {
                id: 'e8',
                type: 'matching',
                title: 'Match Together',
                voiceText: 'Match the correct pair.',
                content: 'C',
                options: ['A-Apple', 'B-Ball', 'C-Cat', 'D-Dog'],
                correctAnswer: 'C'
            },
            {
                id: 'e9',
                type: 'trace',
                title: 'Let&s Write C',
            voiceText: 'Now write the letter C.',
                content: 'C'
            },
            {
                id: 'e10',
                type: 'quiz',
                title: 'Final Challenge',
                voiceText: 'Cat starts with which letter?',
                content: '🐱',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'C'
            }
        ]
    },

    'english-d': {
        id: 'english-d',
        letter: 'D',
        word: 'Dog',
        wordEn: 'Dog',
        emoji: '🐶',
        color: 'from-yellow-400 to-orange-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'Meet Dog! 🐶',
                voiceText: 'Hello little friend! This is a Dog. Dog starts with the letter D.',
                content: '🐶 Dog'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'Listen & Repeat',
                voiceText: 'D... Dog. Say with me. D... Dog.',
                content: 'D'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'Say it loudly!',
                voiceText: 'D for Dog!',
                content: 'D'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: 'Where is D?',
                voiceText: 'Can you find the letter D?',
                content: '🔍',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'D'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'Pop D!',
                voiceText: 'Pop the bubble with letter D.',
                content: '🫧',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'D'
            },
            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'Find the first letter',
                voiceText: 'Dog starts with which letter?',
                content: '🐶 Dog',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'D'
            },
            {
                id: 'e7',
                type: 'word-builder',
                title: 'Build Dog',
                voiceText: 'Let&s build the word Dog.',
            content: 'Dog',
                options: ['D', 'o', 'g'],
                correctAnswer: 'Dog'
            },
            {
                id: 'e8',
                type: 'matching',
                title: 'Match Together',
                voiceText: 'Match the correct pair.',
                content: 'D',
                options: ['A-Apple', 'B-Ball', 'C-Cat', 'D-Dog'],
                correctAnswer: 'D'
            },
            {
                id: 'e9',
                type: 'trace',
                title: 'Let&s Write D',
            voiceText: 'Now write the letter D.',
                content: 'D'
            },
            {
                id: 'e10',
                type: 'quiz',
                title: 'Final Challenge',
                voiceText: 'Dog starts with which letter?',
                content: '🐶',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'D'
            }
        ]
    },

    'english-e': {
        id: 'english-e',
        letter: 'E',
        word: 'Egg',
        wordEn: 'Egg',
        emoji: '🥚',
        color: 'from-emerald-400 to-green-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'Meet Egg! 🥚',
                voiceText: 'Hello little friend! This is an Egg. Egg starts with the letter E.',
                content: '🥚 Egg'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'Listen & Repeat',
                voiceText: 'E... Egg. Say with me. E... Egg.',
                content: 'E'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'Say it loudly!',
                voiceText: 'E for Egg!',
                content: 'E'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: 'Where is E?',
                voiceText: 'Can you find the letter E?',
                content: '🔍',
                options: ['E', 'F', 'G', 'H'],
                correctAnswer: 'E'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'Pop E!',
                voiceText: 'Pop the bubble with letter E.',
                content: '🫧',
                options: ['E', 'F', 'G', 'H'],
                correctAnswer: 'E'
            },
            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'Find the first letter',
                voiceText: 'Egg starts with which letter?',
                content: '🥚 Egg',
                options: ['E', 'A', 'G', 'F'],
                correctAnswer: 'E'
            },
            {
                id: 'e7',
                type: 'word-builder',
                title: 'Build Egg',
                voiceText: 'Let&s build the word Egg.',
            content: 'Egg',
                options: ['E', 'g', 'g'],
                correctAnswer: 'Egg'
            },
            {
                id: 'e8',
                type: 'matching',
                title: 'Match Together',
                voiceText: 'Match the correct pair.',
                content: 'E',
                options: ['E-Egg', 'F-Fish', 'G-Goat', 'H-Hen'],
                correctAnswer: 'E'
            },
            {
                id: 'e9',
                type: 'trace',
                title: 'Let&s Write E',
            voiceText: 'Now write the letter E.',
                content: 'E'
            },
            {
                id: 'e10',
                type: 'quiz',
                title: 'Final Challenge',
                voiceText: 'Egg starts with which letter?',
                content: '🥚',
                options: ['F', 'E', 'G', 'H'],
                correctAnswer: 'E'
            }
        ]
    },
    'english-f': {
        id: 'english-f', letter: 'F', word: 'Fish', wordEn: 'Fish', emoji: '🐠',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'F for Fish', content: 'F' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Fish', voiceText: 'Fish', content: 'Fish' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'F for Fish', content: 'F' },
            { id: 'e4', type: 'tap-correct', title: 'Find F!', voiceText: 'Find the letter F', content: 'F', options: ['E', 'F', 'P', 'T'], correctAnswer: 'F' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'F', options: ['E', 'F', 'P', 'T'], correctAnswer: 'F' },
            // { id: 'e6', type: 'archery-target', title: 'Hit the target!', voiceText: 'Hit the correct letter', content: 'F', options: ['E', 'F', 'P', 'T'], correctAnswer: 'F' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'F', options: ['E', 'F', 'P', 'T'], correctAnswer: 'F' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Fish', content: 'Fish', options: ['F', 'i', 's', 'h'], correctAnswer: 'Fish' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match the letters with words', content: 'F', options: ['E-Egg', 'F-Fish', 'G-Goat', 'H-Hat'], correctAnswer: 'F' },
            { id: 'e10', type: 'trace', title: 'Write F', voiceText: 'Write the letter F', content: 'F' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Fish starts with which letter?', content: 'F', options: ['E', 'P', 'T', 'F'], correctAnswer: 'F' },
        ],
    },
    'english-g': {
        id: 'english-g', letter: 'G', word: 'Goat', wordEn: 'Goat', emoji: '🐐',
        color: 'from-lime-400 to-green-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'G for Goat', content: 'G' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Goat', voiceText: 'Goat', content: 'Goat' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'G for Goat', content: 'G' },
            { id: 'e4', type: 'tap-correct', title: 'Find G!', voiceText: 'Find the letter G', content: 'G', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'G' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'G', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'G' },
            // { id: 'e6', type: 'archery-target', title: 'Hit the target!', voiceText: 'Hit the correct letter', content: 'G', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'G' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'G', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'G' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Goat', content: 'Goat', options: ['G', 'o', 'a', 't'], correctAnswer: 'Goat' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match the letters with words', content: 'G', options: ['E-Egg', 'F-Fish', 'G-Goat', 'H-Hat'], correctAnswer: 'G' },
            { id: 'e10', type: 'trace', title: 'Write G', voiceText: 'Write the letter G', content: 'G' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Goat starts with which letter?', content: 'G', options: ['C', 'O', 'G', 'Q'], correctAnswer: 'G' },
        ],
    },
    'english-h': {
        id: 'english-h', letter: 'H', word: 'Hat', wordEn: 'Hat', emoji: '🎩',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'H for Hat', content: 'H' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Hat', voiceText: 'Hat', content: 'Hat' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'H for Hat', content: 'H' },
            { id: 'e4', type: 'tap-correct', title: 'Find H!', voiceText: 'Find the letter H', content: 'H', options: ['H', 'I', 'M', 'N'], correctAnswer: 'H' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'H', options: ['H', 'I', 'M', 'N'], correctAnswer: 'H' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'H', options: ['H', 'I', 'M', 'N'], correctAnswer: 'H' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Hat', content: 'Hat', options: ['H', 'a', 't'], correctAnswer: 'Hat' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match the letters with words', content: 'H', options: ['G-Goat', 'H-Hat', 'I-Ice', 'J-Jam'], correctAnswer: 'H' },
            { id: 'e10', type: 'trace', title: 'Write H', voiceText: 'Write the letter H', content: 'H' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Hat starts with which letter?', content: 'H', options: ['I', 'H', 'M', 'N'], correctAnswer: 'H' },
        ],
    },
    'english-i': {
        id: 'english-i', letter: 'I', word: 'Ice', wordEn: 'Ice', emoji: '🧊',
        color: 'from-sky-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'I for Ice', content: 'I' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Ice', voiceText: 'Ice', content: 'Ice' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'I for Ice', content: 'I' },
            { id: 'e4', type: 'tap-correct', title: 'Find I!', voiceText: 'Find the letter I', content: 'I', options: ['I', 'J', 'L', 'K'], correctAnswer: 'I' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'I', options: ['I', 'J', 'L', 'K'], correctAnswer: 'I' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'I', options: ['I', 'J', 'L', 'K'], correctAnswer: 'I' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Ice', content: 'Ice', options: ['I', 'c', 'e'], correctAnswer: 'Ice' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match the letters with words', content: 'I', options: ['H-Hat', 'I-Ice', 'J-Jam', 'K-Key'], correctAnswer: 'I' },
            { id: 'e10', type: 'trace', title: 'Write I', voiceText: 'Write the letter I', content: 'I' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Ice starts with which letter?', content: 'I', options: ['J', 'I', 'K', 'L'], correctAnswer: 'I' },
        ],
    },
    'english-j': {
        id: 'english-j', letter: 'J', word: 'Jam', wordEn: 'Jam', emoji: '🍓',
        color: 'from-rose-400 to-pink-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'J for Jam', content: 'J' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Jam', voiceText: 'Jam', content: 'Jam' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'J for Jam', content: 'J' },
            { id: 'e4', type: 'tap-correct', title: 'Find J!', voiceText: 'Find the letter J', content: 'J', options: ['I', 'J', 'K', 'L'], correctAnswer: 'J' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'J', options: ['I', 'J', 'K', 'L'], correctAnswer: 'J' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'J', options: ['I', 'J', 'K', 'L'], correctAnswer: 'J' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Jam', content: 'Jam', options: ['J', 'a', 'm'], correctAnswer: 'Jam' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match the letters with words', content: 'J', options: ['I-Ice', 'J-Jam', 'K-Key', 'L-Lamp'], correctAnswer: 'J' },
            { id: 'e10', type: 'trace', title: 'Write J', voiceText: 'Write the letter J', content: 'J' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Jam starts with which letter?', content: 'J', options: ['I', 'K', 'J', 'L'], correctAnswer: 'J' },
        ],
    },
    'english-k': {
        id: 'english-k', letter: 'K', word: 'Key', wordEn: 'Key', emoji: '🔑',
        color: 'from-yellow-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'K for Key', content: 'K' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Key', voiceText: 'Key', content: 'Key' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'K for Key', content: 'K' },
            { id: 'e4', type: 'tap-correct', title: 'Find K!', voiceText: 'Find the letter K', content: 'K', options: ['J', 'K', 'L', 'M'], correctAnswer: 'K' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'K', options: ['J', 'K', 'L', 'M'], correctAnswer: 'K' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'K', options: ['J', 'K', 'L', 'M'], correctAnswer: 'K' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Key', content: 'Key', options: ['K', 'e', 'y'], correctAnswer: 'Key' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match the letters with words', content: 'K', options: ['J-Jam', 'K-Key', 'L-Lamp', 'M-Moon'], correctAnswer: 'K' },
            { id: 'e10', type: 'trace', title: 'Write K', voiceText: 'Write the letter K', content: 'K' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Key starts with which letter?', content: 'K', options: ['J', 'L', 'K', 'M'], correctAnswer: 'K' },
        ],
    },
    'english-l': {
        id: 'english-l', letter: 'L', word: 'Lamp', wordEn: 'Lamp', emoji: '💡',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'L for Lamp', content: 'L' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Lamp', voiceText: 'Lamp', content: 'Lamp' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'L for Lamp', content: 'L' },
            { id: 'e4', type: 'tap-correct', title: 'Find L!', voiceText: 'Find the letter L', content: 'L', options: ['K', 'L', 'M', 'N'], correctAnswer: 'L' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'L', options: ['K', 'L', 'M', 'N'], correctAnswer: 'L' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'L', options: ['K', 'L', 'M', 'N'], correctAnswer: 'L' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Lamp', content: 'Lamp', options: ['L', 'a', 'm', 'p'], correctAnswer: 'Lamp' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match the letters with words', content: 'L', options: ['K-Key', 'L-Lamp', 'M-Moon', 'N-Net'], correctAnswer: 'L' },
            { id: 'e10', type: 'trace', title: 'Write L', voiceText: 'Write the letter L', content: 'L' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Lamp starts with which letter?', content: 'L', options: ['K', 'M', 'L', 'N'], correctAnswer: 'L' },
        ],
    },
    'english-m': {
        id: 'english-m', letter: 'M', word: 'Moon', wordEn: 'Moon', emoji: '🌙',
        color: 'from-indigo-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'M for Moon', content: 'M' },
            { id: 'e2', type: 'listen-repeat', title: 'Say - Moon', voiceText: 'Moon', content: 'Moon' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'M for Moon', content: 'M' },
            { id: 'e4', type: 'tap-correct', title: 'Find M!', voiceText: 'Find the letter M', content: 'M', options: ['L', 'M', 'N', 'W'], correctAnswer: 'M' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'M', options: ['L', 'M', 'N', 'W'], correctAnswer: 'M' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'M', options: ['L', 'M', 'N', 'W'], correctAnswer: 'M' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Moon', content: 'Moon', options: ['M', 'o', 'o', 'n'], correctAnswer: 'Moon' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'M', options: ['L-Lamp', 'M-Moon', 'N-Net', 'O-Orange'], correctAnswer: 'M' },
            { id: 'e10', type: 'trace', title: 'Write M', voiceText: 'Write the letter M', content: 'M' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Moon starts with which letter?', content: 'M', options: ['L', 'N', 'M', 'W'], correctAnswer: 'M' },
        ],
    },
    'english-n': {
        id: 'english-n', letter: 'N', word: 'Nest', wordEn: 'Nest', emoji: '🪺',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'N for Nest', content: 'N' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Nest', voiceText: 'Nest', content: 'Nest' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'N for Nest', content: 'N' },
            { id: 'e4', type: 'tap-correct', title: 'Find N!', voiceText: 'Find the letter N', content: 'N', options: ['M', 'N', 'H', 'U'], correctAnswer: 'N' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'N', options: ['M', 'N', 'H', 'U'], correctAnswer: 'N' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'N', options: ['M', 'N', 'H', 'U'], correctAnswer: 'N' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Nest', content: 'Nest', options: ['N', 'e', 's', 't'], correctAnswer: 'Nest' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'N', options: ['M-Moon', 'N-Nest', 'O-Orange', 'P-Pen'], correctAnswer: 'N' },
            { id: 'e10', type: 'trace', title: 'Write N', voiceText: 'Write the letter N', content: 'N' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Nest starts with which letter?', content: 'N', options: ['M', 'H', 'N', 'U'], correctAnswer: 'N' },
        ],
    },
    'english-o': {
        id: 'english-o', letter: 'O', word: 'Orange', wordEn: 'Orange', emoji: '🍊',
        color: 'from-orange-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'O for Orange', content: 'O' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Orange', voiceText: 'Orange', content: 'Orange' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'O for Orange', content: 'O' },
            { id: 'e4', type: 'tap-correct', title: 'Find O!', voiceText: 'Find the letter O', content: 'O', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'O' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'O', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'O' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'O', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'O' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Orange', content: 'Orange', options: ['O', 'r', 'a', 'n', 'g', 'e'], correctAnswer: 'Orange' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'O', options: ['N-Nest', 'O-Orange', 'P-Pen', 'Q-Queen'], correctAnswer: 'O' },
            { id: 'e10', type: 'trace', title: 'Write O', voiceText: 'Write the letter O', content: 'O' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Orange starts with which letter?', content: 'O', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'O' },
        ],
    },
    'english-p': {
        id: 'english-p', letter: 'P', word: 'Parrot', wordEn: 'Parrot', emoji: '🦜',
        color: 'from-green-400 to-emerald-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'P for Parrot', content: 'P' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Parrot', voiceText: 'Parrot', content: 'Parrot' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'P for Parrot', content: 'P' },
            { id: 'e4', type: 'tap-correct', title: 'Find P!', voiceText: 'Find the letter P', content: 'P', options: ['B', 'D', 'P', 'R'], correctAnswer: 'P' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'P', options: ['B', 'D', 'P', 'R'], correctAnswer: 'P' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'P', options: ['B', 'D', 'P', 'R'], correctAnswer: 'P' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Parrot', content: 'Parrot', options: ['P', 'a', 'r', 'r', 'o', 't'], correctAnswer: 'Parrot' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'P', options: ['O-Orange', 'P-Parrot', 'Q-Queen', 'R-Rabbit'], correctAnswer: 'P' },
            { id: 'e10', type: 'trace', title: 'Write P', voiceText: 'Write the letter P', content: 'P' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Parrot starts with which letter?', content: 'P', options: ['B', 'D', 'P', 'R'], correctAnswer: 'P' },
        ],
    },
    'english-q': {
        id: 'english-q', letter: 'Q', word: 'Queen', wordEn: 'Queen', emoji: '👑',
        color: 'from-yellow-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'Q for Queen', content: 'Q' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Queen', voiceText: 'Queen', content: 'Queen' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'Q for Queen', content: 'Q' },
            { id: 'e4', type: 'tap-correct', title: 'Find Q!', voiceText: 'Find the letter Q', content: 'Q', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'Q' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'Q', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'Q' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'Q', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'Q' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Queen', content: 'Queen', options: ['Q', 'u', 'e', 'e', 'n'], correctAnswer: 'Queen' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'Q', options: ['P-Parrot', 'Q-Queen', 'R-Rabbit', 'S-Sun'], correctAnswer: 'Q' },
            { id: 'e10', type: 'trace', title: 'Write Q', voiceText: 'Write the letter Q', content: 'Q' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Queen starts with which letter?', content: 'Q', options: ['C', 'G', 'O', 'Q'], correctAnswer: 'Q' },
        ],
    },
    'english-r': {
        id: 'english-r', letter: 'R', word: 'Rabbit', wordEn: 'Rabbit', emoji: '🐰',
        color: 'from-pink-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'R for Rabbit', content: 'R' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Rabbit', voiceText: 'Rabbit', content: 'Rabbit' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'R for Rabbit', content: 'R' },
            { id: 'e4', type: 'tap-correct', title: 'Find R!', voiceText: 'Find the letter R', content: 'R', options: ['B', 'D', 'P', 'R'], correctAnswer: 'R' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'R', options: ['B', 'D', 'P', 'R'], correctAnswer: 'R' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'R', options: ['B', 'D', 'P', 'R'], correctAnswer: 'R' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Rabbit', content: 'Rabbit', options: ['R', 'a', 'b', 'b', 'i', 't'], correctAnswer: 'Rabbit' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'R', options: ['Q-Queen', 'R-Rabbit', 'S-Sun', 'T-Tiger'], correctAnswer: 'R' },
            { id: 'e10', type: 'trace', title: 'Write R', voiceText: 'Write the letter R', content: 'R' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Rabbit starts with which letter?', content: 'R', options: ['B', 'D', 'P', 'R'], correctAnswer: 'R' },
        ],
    },
    'english-s': {
        id: 'english-s', letter: 'S', word: 'Sun', wordEn: 'Sun', emoji: '☀️',
        color: 'from-yellow-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'S for Sun', content: 'S' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Sun', voiceText: 'Sun', content: 'Sun' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'S for Sun', content: 'S' },
            { id: 'e4', type: 'tap-correct', title: 'Find S!', voiceText: 'Find the letter S', content: 'S', options: ['R', 'S', 'T', 'U'], correctAnswer: 'S' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'S', options: ['R', 'S', 'T', 'U'], correctAnswer: 'S' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'S', options: ['R', 'S', 'T', 'U'], correctAnswer: 'S' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Sun', content: 'Sun', options: ['S', 'u', 'n'], correctAnswer: 'Sun' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'S', options: ['R-Rabbit', 'S-Sun', 'T-Tiger', 'U-Umbrella'], correctAnswer: 'S' },
            { id: 'e10', type: 'trace', title: 'Write S', voiceText: 'Write the letter S', content: 'S' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Sun starts with which letter?', content: 'S', options: ['R', 'T', 'S', 'U'], correctAnswer: 'S' },
        ],
    },
    'english-t': {
        id: 'english-t', letter: 'T', word: 'Tiger', wordEn: 'Tiger', emoji: '🐯',
        color: 'from-orange-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'T for Tiger', content: 'T' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Tiger', voiceText: 'Tiger', content: 'Tiger' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'T for Tiger', content: 'T' },
            { id: 'e4', type: 'tap-correct', title: 'Find T!', voiceText: 'Find the letter T', content: 'T', options: ['F', 'I', 'L', 'T'], correctAnswer: 'T' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'T', options: ['F', 'I', 'L', 'T'], correctAnswer: 'T' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'T', options: ['F', 'I', 'L', 'T'], correctAnswer: 'T' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Tiger', content: 'Tiger', options: ['T', 'i', 'g', 'e', 'r'], correctAnswer: 'Tiger' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'T', options: ['S-Sun', 'T-Tiger', 'U-Umbrella', 'V-Van'], correctAnswer: 'T' },
            { id: 'e10', type: 'trace', title: 'Write T', voiceText: 'Write the letter T', content: 'T' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Tiger starts with which letter?', content: 'T', options: ['F', 'I', 'L', 'T'], correctAnswer: 'T' },
        ],
    },
    'english-u': {
        id: 'english-u', letter: 'U', word: 'Umbrella', wordEn: 'Umbrella', emoji: '☂️',
        color: 'from-blue-400 to-indigo-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'U for Umbrella', content: 'U' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Umbrella', voiceText: 'Umbrella', content: 'Umbrella' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'U for Umbrella', content: 'U' },
            { id: 'e4', type: 'tap-correct', title: 'Find U!', voiceText: 'Find the letter U', content: 'U', options: ['N', 'U', 'V', 'W'], correctAnswer: 'U' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'U', options: ['N', 'U', 'V', 'W'], correctAnswer: 'U' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'U', options: ['N', 'U', 'V', 'W'], correctAnswer: 'U' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Umbrella', content: 'Umbrella', options: ['U', 'm', 'b', 'r', 'e', 'l', 'l', 'a'], correctAnswer: 'Umbrella' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'U', options: ['T-Tiger', 'U-Umbrella', 'V-Van', 'W-Water'], correctAnswer: 'U' },
            { id: 'e10', type: 'trace', title: 'Write U', voiceText: 'Write the letter U', content: 'U' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Umbrella starts with which letter?', content: 'U', options: ['N', 'V', 'U', 'W'], correctAnswer: 'U' },
        ],
    },
    'english-v': {
        id: 'english-v', letter: 'V', word: 'Van', wordEn: 'Van', emoji: '🚐',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'V for Van', content: 'V' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Van', voiceText: 'Van', content: 'Van' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'V for Van', content: 'V' },
            { id: 'e4', type: 'tap-correct', title: 'Find V!', voiceText: 'Find the letter V', content: 'V', options: ['U', 'V', 'W', 'Y'], correctAnswer: 'V' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'V', options: ['U', 'V', 'W', 'Y'], correctAnswer: 'V' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'V', options: ['U', 'V', 'W', 'Y'], correctAnswer: 'V' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Van', content: 'Van', options: ['V', 'a', 'n'], correctAnswer: 'Van' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'V', options: ['U-Umbrella', 'V-Van', 'W-Water', 'X-Xray'], correctAnswer: 'V' },
            { id: 'e10', type: 'trace', title: 'Write V', voiceText: 'Write the letter V', content: 'V' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Van starts with which letter?', content: 'V', options: ['U', 'W', 'V', 'Y'], correctAnswer: 'V' },
        ],
    },
    'english-w': {
        id: 'english-w', letter: 'W', word: 'Water', wordEn: 'Water', emoji: '💧',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'W for Water', content: 'W' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Water', voiceText: 'Water', content: 'Water' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'W for Water', content: 'W' },
            { id: 'e4', type: 'tap-correct', title: 'Find W!', voiceText: 'Find the letter W', content: 'W', options: ['M', 'V', 'W', 'X'], correctAnswer: 'W' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'W', options: ['M', 'V', 'W', 'X'], correctAnswer: 'W' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'W', options: ['M', 'V', 'W', 'X'], correctAnswer: 'W' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Water', content: 'Water', options: ['W', 'a', 't', 'e', 'r'], correctAnswer: 'Water' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'W', options: ['V-Van', 'W-Water', 'X-Xray', 'Y-Yak'], correctAnswer: 'W' },
            { id: 'e10', type: 'trace', title: 'Write W', voiceText: 'Write the letter W', content: 'W' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Water starts with which letter?', content: 'W', options: ['M', 'V', 'W', 'X'], correctAnswer: 'W' },
        ],
    },
    'english-x': {
        id: 'english-x', letter: 'X', word: 'X-ray', wordEn: 'X-ray', emoji: '🦴',
        color: 'from-gray-400 to-slate-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'X for X-ray', content: 'X' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — X-ray', voiceText: 'X-ray', content: 'X-ray' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'X for X-ray', content: 'X' },
            { id: 'e4', type: 'tap-correct', title: 'Find X!', voiceText: 'Find the letter X', content: 'X', options: ['K', 'T', 'X', 'Z'], correctAnswer: 'X' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'X', options: ['K', 'T', 'X', 'Z'], correctAnswer: 'X' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'X', options: ['K', 'T', 'X', 'Z'], correctAnswer: 'X' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word X-ray', content: 'X-ray', options: ['X', '-', 'r', 'a', 'y'], correctAnswer: 'X-ray' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'X', options: ['W-Water', 'X-Xray', 'Y-Yak', 'Z-Zebra'], correctAnswer: 'X' },
            { id: 'e10', type: 'trace', title: 'Write X', voiceText: 'Write the letter X', content: 'X' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'X-ray starts with which letter?', content: 'X', options: ['K', 'T', 'X', 'Z'], correctAnswer: 'X' },
        ],
    },
    'english-y': {
        id: 'english-y', letter: 'Y', word: 'Yak', wordEn: 'Yak', emoji: '🐃',
        color: 'from-lime-400 to-green-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'Y for Yak', content: 'Y' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Yak', voiceText: 'Yak', content: 'Yak' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'Y for Yak', content: 'Y' },
            { id: 'e4', type: 'tap-correct', title: 'Find Y!', voiceText: 'Find the letter Y', content: 'Y', options: ['T', 'V', 'X', 'Y'], correctAnswer: 'Y' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'Y', options: ['T', 'V', 'X', 'Y'], correctAnswer: 'Y' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'Y', options: ['T', 'V', 'X', 'Y'], correctAnswer: 'Y' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Yak', content: 'Yak', options: ['Y', 'a', 'k'], correctAnswer: 'Yak' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'Y', options: ['X-Xray', 'Y-Yak', 'Z-Zebra', 'A-Apple'], correctAnswer: 'Y' },
            { id: 'e10', type: 'trace', title: 'Write Y', voiceText: 'Write the letter Y', content: 'Y' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Yak starts with which letter?', content: 'Y', options: ['T', 'V', 'X', 'Y'], correctAnswer: 'Y' },
        ],
    },
    'english-z': {
        id: 'english-z', letter: 'Z', word: 'Zebra', wordEn: 'Zebra', emoji: '🦓',
        color: 'from-slate-400 to-gray-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'What is this?', voiceText: 'Z for Zebra', content: 'Z' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Zebra', voiceText: 'Zebra', content: 'Zebra' },
            { id: 'e3', type: 'pronounce', title: 'Say it loud!', voiceText: 'Z for Zebra', content: 'Z' },
            { id: 'e4', type: 'tap-correct', title: 'Find Z!', voiceText: 'Find the letter Z', content: 'Z', options: ['N', 'S', 'X', 'Z'], correctAnswer: 'Z' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop the bubble!', voiceText: 'Pop the correct bubble', content: 'Z', options: ['N', 'S', 'X', 'Z'], correctAnswer: 'Z' },
            { id: 'e7', type: 'letter-puzzle', title: 'Solve it!', voiceText: 'Pick the correct letter', content: 'Z', options: ['N', 'S', 'X', 'Z'], correctAnswer: 'Z' },
            { id: 'e8', type: 'word-builder', title: 'Build the word!', voiceText: 'Build the word Zebra', content: 'Zebra', options: ['Z', 'e', 'b', 'r', 'a'], correctAnswer: 'Zebra' },
            { id: 'e9', type: 'matching', title: 'Match them!', voiceText: 'Match letters with words', content: 'Z', options: ['X-Xray', 'Y-Yak', 'Z-Zebra', 'A-Apple'], correctAnswer: 'Z' },
            { id: 'e10', type: 'trace', title: 'Write Z', voiceText: 'Write the letter Z', content: 'Z' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Zebra starts with which letter?', content: 'Z', options: ['N', 'S', 'X', 'Z'], correctAnswer: 'Z' },
        ],
    },

    // ─── Capital & Small ──────────────────────────────────────────
    'english-caps-1': {
        id: 'english-caps-1', letter: 'Aa', word: 'Aa Bb Cc Dd', wordEn: 'Capital & Small', emoji: '📝',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'Capital vs Small', voiceText: 'A capital and a small', content: 'Aa' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Aa', voiceText: 'Capital A, small a', content: 'Aa' },
            { id: 'e4', type: 'tap-correct', title: 'Find small a!', voiceText: 'Find the small letter a', content: 'a', options: ['A', 'a', 'B', 'b'], correctAnswer: 'a' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop capital A!', voiceText: 'Pop capital A', content: 'A', options: ['A', 'a', 'B', 'b'], correctAnswer: 'A' },
            { id: 'e7', type: 'matching', title: 'Match Capital & Small!', voiceText: 'Match capital with small', content: 'Aa', options: ['A-a', 'B-b', 'C-c', 'D-d'], correctAnswer: 'A-a' },
            { id: 'e10', type: 'trace', title: 'Write Aa', voiceText: 'Write capital A and small a', content: 'A' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Which is the small letter a?', content: 'a', options: ['A', 'a', 'B', 'b'], correctAnswer: 'a' },
        ],
    },
    'english-caps-2': {
        id: 'english-caps-2', letter: 'Ee', word: 'Ee Ff Gg Hh', wordEn: 'Capital & Small', emoji: '📝',
        color: 'from-blue-400 to-cyan-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'Capital vs Small', voiceText: 'E capital and e small', content: 'Ee' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Ee', voiceText: 'Capital E, small e', content: 'Ee' },
            { id: 'e4', type: 'tap-correct', title: 'Find small e!', voiceText: 'Find the small letter e', content: 'e', options: ['E', 'e', 'F', 'f'], correctAnswer: 'e' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop capital F!', voiceText: 'Pop capital F', content: 'F', options: ['E', 'F', 'G', 'H'], correctAnswer: 'F' },
            { id: 'e7', type: 'matching', title: 'Match Capital & Small!', voiceText: 'Match capital with small', content: 'Ee', options: ['E-e', 'F-f', 'G-g', 'H-h'], correctAnswer: 'E-e' },
            { id: 'e10', type: 'trace', title: 'Write Ee', voiceText: 'Write capital E and small e', content: 'E' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Which is the small letter g?', content: 'g', options: ['G', 'g', 'H', 'h'], correctAnswer: 'g' },
        ],
    },
    'english-caps-3': {
        id: 'english-caps-3', letter: 'Ii', word: 'Ii Jj Kk Ll', wordEn: 'Capital & Small', emoji: '📝',
        color: 'from-emerald-400 to-teal-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'Capital vs Small', voiceText: 'I capital and i small', content: 'Ii' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Ii', voiceText: 'Capital I, small i', content: 'Ii' },
            { id: 'e4', type: 'tap-correct', title: 'Find small i!', voiceText: 'Find the small letter i', content: 'i', options: ['I', 'i', 'J', 'j'], correctAnswer: 'i' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop capital K!', voiceText: 'Pop capital K', content: 'K', options: ['I', 'J', 'K', 'L'], correctAnswer: 'K' },
            { id: 'e7', type: 'matching', title: 'Match Capital & Small!', voiceText: 'Match capital with small', content: 'Ii', options: ['I-i', 'J-j', 'K-k', 'L-l'], correctAnswer: 'I-i' },
            { id: 'e10', type: 'trace', title: 'Write Ii', voiceText: 'Write capital I and small i', content: 'I' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Which is the small letter k?', content: 'k', options: ['K', 'k', 'L', 'l'], correctAnswer: 'k' },
        ],
    },
    'english-caps-4': {
        id: 'english-caps-4', letter: 'Mm', word: 'Mm Nn Oo Pp', wordEn: 'Capital & Small', emoji: '📝',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'Capital vs Small', voiceText: 'M capital and m small', content: 'Mm' },
            { id: 'e2', type: 'listen-repeat', title: 'Say — Mm', voiceText: 'Capital M, small m', content: 'Mm' },
            { id: 'e4', type: 'tap-correct', title: 'Find small m!', voiceText: 'Find the small letter m', content: 'm', options: ['M', 'm', 'N', 'n'], correctAnswer: 'm' },
            { id: 'e5', type: 'bubble-pop', title: 'Pop capital O!', voiceText: 'Pop capital O', content: 'O', options: ['M', 'N', 'O', 'P'], correctAnswer: 'O' },
            { id: 'e7', type: 'matching', title: 'Match Capital & Small!', voiceText: 'Match capital with small', content: 'Mm', options: ['M-m', 'N-n', 'O-o', 'P-p'], correctAnswer: 'M-m' },
            { id: 'e10', type: 'trace', title: 'Write Mm', voiceText: 'Write capital M and small m', content: 'M' },
            { id: 'e11', type: 'quiz', title: 'Final question!', voiceText: 'Which is the small letter p?', content: 'p', options: ['P', 'p', 'Q', 'q'], correctAnswer: 'p' },
        ],
    },
    'english-caps-5': {
        id: 'english-caps-5', letter: '🔄', word: 'সব অক্ষর রিভিশন', wordEn: 'Full Review', emoji: '🌟',
        color: 'from-rose-400 to-pink-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/english',
        exercises: [
            { id: 'e1', type: 'intro', title: 'সব অক্ষর!', voiceText: 'A to Z review time!', content: '🔄' },
            { id: 'e4', type: 'tap-correct', title: 'Apple?', voiceText: 'Apple starts with?', content: 'A', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 'e5', type: 'tap-correct', title: 'Moon?', voiceText: 'Moon starts with?', content: 'M', options: ['L', 'M', 'N', 'O'], correctAnswer: 'M' },
            { id: 'e6', type: 'tap-correct', title: 'Zebra?', voiceText: 'Zebra starts with?', content: 'Z', options: ['X', 'Y', 'Z', 'W'], correctAnswer: 'Z' },
            { id: 'e7', type: 'matching', title: 'সব মেলাও!', voiceText: 'Match all letters', content: '🔄', options: ['A-Apple', 'M-Moon', 'Z-Zebra', 'S-Sun'], correctAnswer: 'A-Apple' },
            { id: 'e9', type: 'bubble-pop', title: 'T pop করো!', voiceText: 'Pop the letter T', content: 'T', options: ['R', 'S', 'T', 'U'], correctAnswer: 'T' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'Tiger starts with which letter?', content: 'T', options: ['R', 'S', 'T', 'U'], correctAnswer: 'T' },
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