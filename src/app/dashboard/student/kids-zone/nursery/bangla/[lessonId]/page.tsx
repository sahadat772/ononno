'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'swarabarna-a': {
        id: 'swarabarna-a', letter: 'অ', word: 'অজগর', wordEn: 'Python Snake', emoji: '🐍',
        color: 'from-red-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'অ দিয়ে অজগর', content: 'অ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — অজগর', voiceText: 'অজগর', content: 'অজগর' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'অ দিয়ে অজগর', content: 'অ' },
            { id: 'e4', type: 'tap-correct', title: 'অ কোথায়?', voiceText: 'অ খুঁজে বের করো', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
            // { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক বর্ণে আঘাত করো', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'অজগর বানাও', content: 'অজগর', options: ['অ', 'জ', 'গ', 'র'], correctAnswer: 'অজগর' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'অ', options: ['অ-অজগর', 'আ-আম', 'ই-ইলিশ', 'ঈ-ঈগল'], correctAnswer: 'অ' },
            { id: 'e10', type: 'trace', title: 'লিখি — অ', voiceText: 'অ লেখো', content: 'অ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'অজগর কোন বর্ণ দিয়ে শুরু?', content: 'অ', options: ['আ', 'অ', 'ই', 'উ'], correctAnswer: 'অ' },
        ],
    },
    'swarabarna-aa': {
        id: 'swarabarna-aa', letter: 'আ', word: 'আম', wordEn: 'Mango', emoji: '🥭',
        color: 'from-orange-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'আ দিয়ে আম', content: 'আ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — আম', voiceText: 'আম', content: 'আম' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'আ দিয়ে আম', content: 'আ' },
            { id: 'e4', type: 'tap-correct', title: 'আ কোথায়?', voiceText: 'আ খুঁজে বের করো', content: 'আ', options: ['অ', 'আ', 'ই', 'খ'], correctAnswer: 'আ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'আ', options: ['অ', 'আ', 'ই', 'খ'], correctAnswer: 'আ' },
            // { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক বর্ণে আঘাত করো', content: 'আ', options: ['অ', 'আ', 'ই', 'খ'], correctAnswer: 'আ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'আ', options: ['অ', 'আ', 'ই', 'খ'], correctAnswer: 'আ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'আম বানাও', content: 'আম', options: ['আ', 'ম', 'অ', 'ন'], correctAnswer: 'আম' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'আ', options: ['অ-অজগর', 'আ-আম', 'ই-ইলিশ', 'ঈ-ঈগল'], correctAnswer: 'আ' },
            { id: 'e10', type: 'trace', title: 'লিখি — আ', voiceText: 'আ লেখো', content: 'আ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'আম কোন বর্ণ দিয়ে শুরু?', content: 'আ', options: ['অ', 'আ', 'ক', 'ঘ'], correctAnswer: 'আ' },
        ],
    },
    'swarabarna-i': {
        id: 'swarabarna-i', letter: 'ই', word: 'ইলিশ', wordEn: 'Hilsa Fish', emoji: '🐟',
        color: 'from-yellow-400 to-lime-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ই দিয়ে ইলিশ', content: 'ই' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ইলিশ', voiceText: 'ইলিশ', content: 'ইলিশ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ই দিয়ে ইলিশ', content: 'ই' },
            { id: 'e4', type: 'tap-correct', title: 'ই কোথায়?', voiceText: 'ই খুঁজে বের করো', content: 'ই', options: ['ঈ', 'উ', 'ই', 'চ'], correctAnswer: 'ই' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'ই', options: ['ঈ', 'উ', 'ই', 'চ'], correctAnswer: 'ই' },
            // { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক বর্ণে আঘাত করো', content: 'ই', options: ['ঈ', 'উ', 'ই', 'চ'], correctAnswer: 'ই' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'ই', options: ['ঈ', 'উ', 'ই', 'চ'], correctAnswer: 'ই' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ইলিশ বানাও', content: 'ইলিশ', options: ['ই', 'ল', 'ি', 'শ'], correctAnswer: 'ইলিশ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ই', options: ['অ-অজগর', 'আ-আম', 'ই-ইলিশ', 'ঈ-ঈগল'], correctAnswer: 'ই' },
            { id: 'e10', type: 'trace', title: 'লিখি — ই', voiceText: 'ই লেখো', content: 'ই' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ইলিশ কোন বর্ণ দিয়ে শুরু?', content: 'ই', options: ['ঈ', 'উ', 'ই', 'অ'], correctAnswer: 'ই' },
        ],
    },

    'swarabarna-ee': {
        id: 'swarabarna-ee', letter: 'ঈ', word: 'ঈগল', wordEn: 'Eagle', emoji: '🦅',
        color: 'from-sky-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঈ দিয়ে ঈগল', content: 'ঈ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঈগল', voiceText: 'ঈগল', content: 'ঈগল' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঈ দিয়ে ঈগল', content: 'ঈ' },
            { id: 'e4', type: 'tap-correct', title: 'ঈ কোথায়?', voiceText: 'ঈ খুঁজে বের করো', content: 'ঈ', options: ['ই', 'ঈ', 'উ', 'ঊ'], correctAnswer: 'ঈ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'ঈ', options: ['ই', 'ঈ', 'উ', 'ঊ'], correctAnswer: 'ঈ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'ঈ', options: ['ই', 'ঈ', 'উ', 'ঊ'], correctAnswer: 'ঈ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঈগল বানাও', content: 'ঈগল', options: ['ঈ', 'গ', 'ল'], correctAnswer: 'ঈগল' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঈ', options: ['ই-ইলিশ', 'ঈ-ঈগল', 'উ-উট', 'ঊ-ঊষা'], correctAnswer: 'ঈ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঈ', voiceText: 'ঈ লেখো', content: 'ঈ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঈগল কোন বর্ণ দিয়ে শুরু?', content: 'ঈ', options: ['ই', 'ঈ', 'উ', 'ঊ'], correctAnswer: 'ঈ' },
        ],
    },
    'swarabarna-u': {
        id: 'swarabarna-u', letter: 'উ', word: 'উট', wordEn: 'Camel', emoji: '🐪',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'উ দিয়ে উট', content: 'উ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — উট', voiceText: 'উট', content: 'উট' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'উ দিয়ে উট', content: 'উ' },
            { id: 'e4', type: 'tap-correct', title: 'উ কোথায়?', voiceText: 'উ খুঁজে বের করো', content: 'উ', options: ['ঈ', 'উ', 'ঊ', 'ঋ'], correctAnswer: 'উ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'উ', options: ['ঈ', 'উ', 'ঊ', 'ঋ'], correctAnswer: 'উ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'উ', options: ['ঈ', 'উ', 'ঊ', 'ঋ'], correctAnswer: 'উ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'উট বানাও', content: 'উট', options: ['উ', 'ট'], correctAnswer: 'উট' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'উ', options: ['ই-ইলিশ', 'ঈ-ঈগল', 'উ-উট', 'ঊ-ঊষা'], correctAnswer: 'উ' },
            { id: 'e10', type: 'trace', title: 'লিখি — উ', voiceText: 'উ লেখো', content: 'উ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'উট কোন বর্ণ দিয়ে শুরু?', content: 'উ', options: ['ই', 'উ', 'ঊ', 'ঋ'], correctAnswer: 'উ' },
        ],
    },
    'swarabarna-uu': {
        id: 'swarabarna-uu', letter: 'ঊ', word: 'ঊষা', wordEn: 'Dawn', emoji: '🌅',
        color: 'from-red-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঊ দিয়ে ঊষা', content: 'ঊ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঊষা', voiceText: 'ঊষা', content: 'ঊষা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঊ দিয়ে ঊষা', content: 'ঊ' },
            { id: 'e4', type: 'tap-correct', title: 'ঊ কোথায়?', voiceText: 'ঊ খুঁজে বের করো', content: 'ঊ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঊ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'ঊ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঊ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'ঊ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঊ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঊষা বানাও', content: 'ঊষা', options: ['ঊ', 'ষা'], correctAnswer: 'ঊষা' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঊ', options: ['ঈ-ঈগল', 'উ-উট', 'ঊ-ঊষা', 'ঋ-ঋষি'], correctAnswer: 'ঊ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঊ', voiceText: 'ঊ লেখো', content: 'ঊ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঊষা কোন বর্ণ দিয়ে শুরু?', content: 'ঊ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঊ' },
        ],
    },
    'swarabarna-ri': {
        id: 'swarabarna-ri', letter: 'ঋ', word: 'ঋষি', wordEn: 'Sage', emoji: '📿',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঋ দিয়ে ঋষি', content: 'ঋ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঋষি', voiceText: 'ঋষি', content: 'ঋষি' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঋ দিয়ে ঋষি', content: 'ঋ' },
            { id: 'e4', type: 'tap-correct', title: 'ঋ কোথায়?', voiceText: 'ঋ খুঁজে বের করো', content: 'ঋ', options: ['ঊ', 'ঋ', 'এ', 'ঐ'], correctAnswer: 'ঋ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'ঋ', options: ['ঊ', 'ঋ', 'এ', 'ঐ'], correctAnswer: 'ঋ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'ঋ', options: ['ঊ', 'ঋ', 'এ', 'ঐ'], correctAnswer: 'ঋ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঋষি বানাও', content: 'ঋষি', options: ['ঋ', 'ষি'], correctAnswer: 'ঋষি' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঋ', options: ['উ-উট', 'ঊ-ঊষা', 'ঋ-ঋষি', 'এ-একতারা'], correctAnswer: 'ঋ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঋ', voiceText: 'ঋ লেখো', content: 'ঋ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঋষি কোন বর্ণ দিয়ে শুরু?', content: 'ঋ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঋ' },
        ],
    },
    'swarabarna-e': {
        id: 'swarabarna-e', letter: 'এ', word: 'একতারা', wordEn: 'Ektara', emoji: '🪕',
        color: 'from-lime-400 to-green-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'এ দিয়ে একতারা', content: 'এ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — একতারা', voiceText: 'একতারা', content: 'একতারা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'এ দিয়ে একতারা', content: 'এ' },
            { id: 'e4', type: 'tap-correct', title: 'এ কোথায়?', voiceText: 'এ খুঁজে বের করো', content: 'এ', options: ['ঋ', 'এ', 'ঐ', 'ও'], correctAnswer: 'এ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'এ', options: ['ঋ', 'এ', 'ঐ', 'ও'], correctAnswer: 'এ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'এ', options: ['ঋ', 'এ', 'ঐ', 'ও'], correctAnswer: 'এ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'একতারা বানাও', content: 'একতারা', options: ['এ', 'ক', 'তা', 'রা'], correctAnswer: 'একতারা' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'এ', options: ['ঊ-ঊষা', 'ঋ-ঋষি', 'এ-একতারা', 'ঐ-ঐরাবত'], correctAnswer: 'এ' },
            { id: 'e10', type: 'trace', title: 'লিখি — এ', voiceText: 'এ লেখো', content: 'এ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'একতারা কোন বর্ণ দিয়ে শুরু?', content: 'এ', options: ['ঋ', 'এ', 'ঐ', 'ও'], correctAnswer: 'এ' },
        ],
    },
    'swarabarna-oi': {
        id: 'swarabarna-oi', letter: 'ঐ', word: 'ঐরাবত', wordEn: 'Elephant', emoji: '🐘',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঐ দিয়ে ঐরাবত', content: 'ঐ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঐরাবত', voiceText: 'ঐরাবত', content: 'ঐরাবত' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঐ দিয়ে ঐরাবত', content: 'ঐ' },
            { id: 'e4', type: 'tap-correct', title: 'ঐ কোথায়?', voiceText: 'ঐ খুঁজে বের করো', content: 'ঐ', options: ['এ', 'ঐ', 'ও', 'ঔ'], correctAnswer: 'ঐ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'ঐ', options: ['এ', 'ঐ', 'ও', 'ঔ'], correctAnswer: 'ঐ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'ঐ', options: ['এ', 'ঐ', 'ও', 'ঔ'], correctAnswer: 'ঐ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঐরাবত বানাও', content: 'ঐরাবত', options: ['ঐ', 'রা', 'ব', 'ত'], correctAnswer: 'ঐরাবত' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঐ', options: ['ঋ-ঋষি', 'এ-একতারা', 'ঐ-ঐরাবত', 'ও-ওজন'], correctAnswer: 'ঐ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঐ', voiceText: 'ঐ লেখো', content: 'ঐ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঐরাবত কোন বর্ণ দিয়ে শুরু?', content: 'ঐ', options: ['এ', 'ঐ', 'ও', 'উ'], correctAnswer: 'ঐ' },
        ],
    },
    'swarabarna-o': {
        id: 'swarabarna-o', letter: 'ও', word: 'ওজন', wordEn: 'Weight', emoji: '⚖️',
        color: 'from-orange-400 to-red-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ও দিয়ে ওজন', content: 'ও' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ওজন', voiceText: 'ওজন', content: 'ওজন' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ও দিয়ে ওজন', content: 'ও' },
            { id: 'e4', type: 'tap-correct', title: 'ও কোথায়?', voiceText: 'ও খুঁজে বের করো', content: 'ও', options: ['ঐ', 'ও', 'ঔ', 'ই'], correctAnswer: 'ও' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'ও', options: ['ঐ', 'ও', 'ঔ', 'ই'], correctAnswer: 'ও' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'ও', options: ['ঐ', 'ও', 'ঔ', 'ই'], correctAnswer: 'ও' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ওজন বানাও', content: 'ওজন', options: ['ও', 'জ', 'ন'], correctAnswer: 'ওজন' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ও', options: ['এ-একতারা', 'ঐ-ঐরাবত', 'ও-ওজন', 'ঔ-ঔষধ'], correctAnswer: 'ও' },
            { id: 'e10', type: 'trace', title: 'লিখি — ও', voiceText: 'ও লেখো', content: 'ও' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ওজন কোন বর্ণ দিয়ে শুরু?', content: 'ও', options: ['ঐ', 'ও', 'ঔ', 'আ'], correctAnswer: 'ও' },
        ],
    },
    'swarabarna-ou': {
        id: 'swarabarna-ou', letter: 'ঔ', word: 'ঔষধ', wordEn: 'Medicine', emoji: '💊',
        color: 'from-pink-400 to-rose-600', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঔ দিয়ে ঔষধ', content: 'ঔ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঔষধ', voiceText: 'ঔষধ', content: 'ঔষধ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঔ দিয়ে ঔষধ', content: 'ঔ' },
            { id: 'e4', type: 'tap-correct', title: 'ঔ কোথায়?', voiceText: 'ঔ খুঁজে বের করো', content: 'ঔ', options: ['ঐ', 'ও', 'ঔ', 'উ'], correctAnswer: 'ঔ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'ঔ', options: ['ঐ', 'ও', 'ঔ', 'উ'], correctAnswer: 'ঔ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'ঔ', options: ['ঐ', 'ও', 'ঔ', 'উ'], correctAnswer: 'ঔ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঔষধ বানাও', content: 'ঔষধ', options: ['ঔ', 'ষ', 'ধ'], correctAnswer: 'ঔষধ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঔ', options: ['ঐ-ঐরাবত', 'ও-ওজন', 'ঔ-ঔষধ', 'ই-ইলিশ'], correctAnswer: 'ঔ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঔ', voiceText: 'ঔ লেখো', content: 'ঔ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঔষধ কোন বর্ণ দিয়ে শুরু?', content: 'ঔ', options: ['ঐ', 'ও', 'ঔ', 'এ'], correctAnswer: 'ঔ' },
        ],
    },
}

export default function BanglaLessonPage() {
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