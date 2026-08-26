'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BookOpen,
    FileText,
    Wand2,
    Check,
    ChevronDown,
    ChevronUp,
    Loader2,
    AlertCircle,
} from 'lucide-react'

type CurriculumClass = {
    id: string
    name: string
    class_number: number
}

type CurriculumSubject = {
    id: string
    name: string
    name_bn: string
    class_id: string
}

type PDFSource = {
    id: string
    file_name: string
    page_count: number
    source_status: string
    workflow_status: string
    total_chapters: number
    total_lessons: number
}

type ExtractedLesson = {
    title: string
    title_bn: string
    page_start: number
    page_end: number
}

type ExtractedChapter = {
    title: string
    title_bn: string
    page_start: number
    page_end: number
    lessons: ExtractedLesson[]
    selected: boolean
    expanded: boolean
}

type ApiExtractedLesson = {
    title?: string
    title_bn?: string
    page_start?: number
    page_end?: number
}

type ApiExtractedChapter = {
    title?: string
    title_bn?: string
    page_start?: number
    page_end?: number
    lessons?: ApiExtractedLesson[]
}

interface Props {
    subjects: CurriculumSubject[]
    classes: CurriculumClass[]
}

const inputClass =
    'w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 transition'

export default function ImportClient({ subjects, classes }: Props) {
    const [step, setStep] = useState<'pdf-select' | 'preview' | 'saving' | 'done'>('pdf-select')

    const [error, setError] = useState<string | null>(null)
    const [extracting, setExtracting] = useState(false)
    const [saving, setSaving] = useState(false)

    const [filterClassId, setFilterClassId] = useState('')
    const [selectedSubjectId, setSelectedSubjectId] = useState('')
    const [selectedPdfId, setSelectedPdfId] = useState('')

    const [pdfSources, setPdfSources] = useState<PDFSource[]>([])
    const [loadingPdfs, setLoadingPdfs] = useState(false)

    const [pageRange, setPageRange] = useState({ start: 1, end: 0 })

    const [chapters, setChapters] = useState<ExtractedChapter[]>([])

    const [savedCount, setSavedCount] = useState({ chapters: 0, lessons: 0 })

    // Fetch PDFs when subject + class are selected
    useEffect(() => {
        if (!selectedSubjectId || !filterClassId) {
            return
        }

        let cancelled = false

        const fetchPdfs = async () => {
            setLoadingPdfs(true)
            setError(null)

            try {
                const res = await fetch(
                    `/api/admin/curriculum/pdf-sources?class_id=${filterClassId}&subject_id=${selectedSubjectId}`
                )

                if (!res.ok) throw new Error('PDFs load করা যায়নি')

                const data = await res.json()
                if (cancelled) return

                setPdfSources(data)

                if (data.length === 0) {
                    setError('এই subject-এর জন্য কোনো PDF উপলব্ধ নেই।')
                }
            } catch (err) {
                if (cancelled) return
                console.error(err)
                setError(err instanceof Error ? err.message : 'PDFs load করা যায়নি')
            } finally {
                if (!cancelled) setLoadingPdfs(false)
            }
        }

        fetchPdfs()

        return () => {
            cancelled = true
        }
    }, [selectedSubjectId, filterClassId])

    const filteredSubjects = useMemo(() => {
        if (!filterClassId) return subjects
        return subjects.filter((subject) => subject.class_id === filterClassId)
    }, [subjects, filterClassId])

    const selectedPdf = pdfSources.find((p) => p.id === selectedPdfId)

    // Extract PDF structure
    async function handleExtract() {
        if (!selectedPdfId) {
            setError('একটি PDF select করো।')
            return
        }

        if (!selectedPdf) {
            setError('PDF পাওয়া যায়নি।')
            return
        }

        setError(null)
        setExtracting(true)

        try {
            const response = await fetch(
                `/api/admin/curriculum/sources/${selectedPdfId}/extract-structure`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        start_page: pageRange.start,
                        end_page: pageRange.end || selectedPdf.page_count,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setError(data?.error || 'Extraction failed.')
                return
            }

            if (!data?.chapters || !Array.isArray(data.chapters) || data.chapters.length === 0) {
                setError('কোনো Chapter পাওয়া যায়নি।')
                return
            }

            const normalized: ExtractedChapter[] = (data.chapters as ApiExtractedChapter[]).map(
                (chapter) => ({
                    title: chapter.title?.trim() || 'Untitled',
                    title_bn: chapter.title_bn?.trim() || 'অজানা',
                    page_start: chapter.page_start || 0,
                    page_end: chapter.page_end || 0,
                    lessons: (chapter.lessons || []).map((lesson) => ({
                        title: lesson.title?.trim() || lesson.title_bn || 'Untitled',
                        title_bn: lesson.title_bn?.trim() || 'অজানা',
                        page_start: lesson.page_start || 0,
                        page_end: lesson.page_end || 0,
                    })),
                    selected: true,
                    expanded: true,
                })
            )

            setChapters(normalized)
            setStep('preview')
        } catch (err) {
            console.error(err)
            setError('Extraction error। আবার চেষ্টা করো।')
        } finally {
            setExtracting(false)
        }
    }

    // Toggle chapter selection
    function toggleChapter(idx: number) {
        setChapters((prev) =>
            prev.map((ch, i) =>
                i === idx ? { ...ch, selected: !ch.selected } : ch
            )
        )
    }

    // Toggle chapter expansion
    function toggleExpanded(idx: number) {
        setChapters((prev) =>
            prev.map((ch, i) =>
                i === idx ? { ...ch, expanded: !ch.expanded } : ch
            )
        )
    }

    // Save chapters to database
    async function handleSave() {
        const selectedChapters = chapters.filter((ch) => ch.selected)

        if (selectedChapters.length === 0) {
            setError('কমপক্ষে একটি Chapter select করো।')
            return
        }

        setSaving(true)
        setStep('saving')
        setError(null)

        let chapterCount = 0
        let lessonCount = 0

        try {
            for (let i = 0; i < selectedChapters.length; i++) {
                const chapter = selectedChapters[i]

                // Create chapter
                const chRes = await fetch(
                    '/api/admin/curriculum/chapters',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            subjectId: selectedSubjectId,
                            classId: filterClassId,
                            title: chapter.title,
                            titleBn: chapter.title_bn,
                            slug: chapter.title.toLowerCase().replace(/\s+/g, '-'),
                            chapterNumber: i + 1,
                            orderIndex: i,
                            description: null,
                        }),
                    }
                )

                const chData = await chRes.json()

                if (!chRes.ok || !chData?.id) {
                    setError(`Chapter ${chapter.title_bn} save করতে পারলাম না।`)
                    continue
                }

                chapterCount++

                // Create lessons
                for (let j = 0; j < chapter.lessons.length; j++) {
                    const lesson = chapter.lessons[j]

                    const lesRes = await fetch(
                        '/api/admin/curriculum/lessons',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chapterId: chData.id,
                                title: lesson.title,
                                titleBn: lesson.title_bn,
                                slug: lesson.title.toLowerCase().replace(/\s+/g, '-'),
                                lessonNumber: j + 1,
                                orderIndex: j,
                                description: null,
                                sourcePageStart: lesson.page_start,
                                sourcePageEnd: lesson.page_end,
                            }),
                        }
                    )

                    const lesData = await lesRes.json()

                    if (!lesRes.ok || !lesData?.id) {
                        console.error(`Lesson ${lesson.title_bn} save করতে পারলাম না।`)
                        continue
                    }

                    lessonCount++
                }
            }

            setSavedCount({ chapters: chapterCount, lessons: lessonCount })
            setStep('done')
        } catch (err) {
            console.error(err)
            setError('Saving এ error হয়েছে। আবার চেষ্টা করো।')
        } finally {
            setSaving(false)
        }
    }

    // Reset
    function handleReset() {
        setStep('pdf-select')
        setError(null)
        setChapters([])
        setSelectedPdfId('')
        setPdfSources([])
        setSavedCount({ chapters: 0, lessons: 0 })
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <BookOpen className="w-8 h-8 text-emerald-400" />
                    <h1 className="text-3xl font-bold text-white">Curriculum PDF Import</h1>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: PDF Selection */}
                    {step === 'pdf-select' && (
                        <motion.div
                            key="pdf-select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Class Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2">
                                    Class নির্বাচন করো
                                </label>
                                <select
                                    value={filterClassId}
                                    onChange={(e) => {
                                        setFilterClassId(e.target.value)
                                        setSelectedSubjectId('')
                                        setSelectedPdfId('')
                                        setPdfSources([])
                                    }}
                                    className={inputClass}
                                >
                                    <option value="">-- Class বেছে নাও --</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subject Selection */}
                            {filterClassId && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">
                                        Subject নির্বাচন করো
                                    </label>
                                    <select
                                        value={selectedSubjectId}
                                        onChange={(e) => {
                                            setSelectedSubjectId(e.target.value)
                                            setSelectedPdfId('')
                                            setPdfSources([])
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">-- Subject বেছে নাও --</option>
                                        {filteredSubjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name_bn}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* PDF Selection */}
                            {selectedSubjectId && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">
                                        PDF নির্বাচন করো
                                    </label>

                                    {loadingPdfs ? (
                                        <div className="flex items-center justify-center p-4">
                                            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mr-2" />
                                            <span className="text-slate-300">PDFs load করছি...</span>
                                        </div>
                                    ) : pdfSources.length === 0 ? (
                                        <div className="bg-slate-700/50 rounded-2xl p-4 text-slate-300">
                                            এই subject-এর জন্য কোনো PDF নেই।
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {pdfSources.map((pdf) => (
                                                <div
                                                    key={pdf.id}
                                                    onClick={() => setSelectedPdfId(pdf.id)}
                                                    className={`p-4 rounded-2xl cursor-pointer transition ${selectedPdfId === pdf.id
                                                            ? 'bg-emerald-500/20 border border-emerald-400'
                                                            : 'bg-slate-700/50 border border-slate-600 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <FileText className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-white">{pdf.file_name}</p>
                                                            <p className="text-sm text-slate-400">
                                                                পৃষ্ঠা: {pdf.page_count} | অধ্যায়: {pdf.total_chapters} | পাঠ: {pdf.total_lessons}
                                                            </p>
                                                        </div>
                                                        {selectedPdfId === pdf.id && (
                                                            <Check className="w-5 h-5 text-emerald-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Page Range Selection */}
                            {selectedPdf && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-200 mb-2">
                                            শুরুর পৃষ্ঠা
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedPdf.page_count}
                                            value={pageRange.start}
                                            onChange={(e) =>
                                                setPageRange((p) => ({
                                                    ...p,
                                                    start: parseInt(e.target.value) || 1,
                                                }))
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-200 mb-2">
                                            শেষের পৃষ্ঠা
                                        </label>
                                        <input
                                            type="number"
                                            min={pageRange.start}
                                            max={selectedPdf.page_count}
                                            value={pageRange.end || selectedPdf.page_count}
                                            onChange={(e) =>
                                                setPageRange((p) => ({
                                                    ...p,
                                                    end: parseInt(e.target.value) || 0,
                                                }))
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-900/20 border border-red-500 rounded-2xl p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-red-200">{error}</p>
                                </div>
                            )}

                            {/* Extract Button */}
                            <button
                                onClick={handleExtract}
                                disabled={!selectedPdf || extracting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                            >
                                {extracting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Extracting...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        PDF থেকে Structure Extract করো
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Preview */}
                    {step === 'preview' && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-slate-200">
                                <h2 className="text-xl font-bold text-white mb-4">Extracted Content Review</h2>
                                <p className="text-sm mb-4">
                                    Total: {chapters.length} chapters, {chapters.reduce((s, c) => s + c.lessons.length, 0)} lessons
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-900/20 border border-red-500 rounded-2xl p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-red-200">{error}</p>
                                </div>
                            )}

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {chapters.map((chapter, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-slate-700/50 rounded-2xl overflow-hidden"
                                    >
                                        <div
                                            onClick={() => toggleChapter(idx)}
                                            className="p-4 cursor-pointer flex items-center gap-3 hover:bg-slate-600 transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={chapter.selected}
                                                onChange={() => toggleChapter(idx)}
                                                className="w-4 h-4"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-white">{chapter.title_bn}</p>
                                                <p className="text-xs text-slate-400">
                                                    পৃষ্ঠা {chapter.page_start}-{chapter.page_end} | {chapter.lessons.length} lessons
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleExpanded(idx)
                                                }}
                                                className="text-slate-400 hover:text-slate-200"
                                            >
                                                {chapter.expanded ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>

                                        {chapter.expanded && (
                                            <div className="bg-slate-800 p-4 space-y-2 border-t border-slate-600">
                                                {chapter.lessons.map((lesson, lidx) => (
                                                    <div key={lidx} className="flex gap-2 text-sm">
                                                        <span className="text-slate-500">— {lesson.title_bn}</span>
                                                        <span className="text-xs text-slate-600">
                                                            (পৃষ্ঠা {lesson.page_start}-{lesson.page_end})
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('pdf-select')}
                                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl transition"
                                >
                                    পিছিয়ে যাও
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Save করো
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Done */}
                    {step === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            <div className="inline-block p-6 bg-emerald-500/20 rounded-full">
                                <Check className="w-12 h-12 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">সম্পন্ন!</h2>
                                <p className="text-slate-300">
                                    {savedCount.chapters} অধ্যায় এবং {savedCount.lessons} পাঠ save হয়েছে।
                                </p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-2xl transition"
                            >
                                আরও PDF import করো
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}