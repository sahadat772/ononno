'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BookOpen,
    FileText,
    Wand2,
    Check,
    X,
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

interface Props {
    subjects: CurriculumSubject[]
    classes: CurriculumClass[]
}

const inputClass =
    'w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 transition'

export default function ImportClient({ subjects, classes }: Props) {
    const [step, setStep] = useState<
        'pdf-select' | 'preview' | 'saving' | 'done'
    >('pdf-select')

    const [error, setError] = useState<string | null>(null)
    const [extracting, setExtracting] = useState(false)
    const [saving, setSaving] = useState(false)

    const [savedCount, setSavedCount] = useState({
        chapters: 0,
        lessons: 0,
    })

    const [filterClassId, setFilterClassId] = useState('')
    const [selectedSubjectId, setSelectedSubjectId] = useState('')
    const [selectedPdfId, setSelectedPdfId] = useState('')
    
    const [pdfSources, setPdfSources] = useState<PDFSource[]>([])
    const [loadingPdfs, setLoadingPdfs] = useState(false)

    const [pageRange, setPageRange] = useState({ start: 1, end: 0 })

    const [chapters, setChapters] = useState<ExtractedChapter[]>([])

    // Fetch PDFs when subject changes
    useEffect(() => {
        if (!selectedSubjectId || !filterClassId) {
            setPdfSources([])
            return
        }

        const fetchPdfs = async () => {
            setLoadingPdfs(true)
            setError(null)

            try {
                const res = await fetch(
                    `/api/admin/curriculum/pdf-sources?class_id=${filterClassId}&subject_id=${selectedSubjectId}`
                )

                if (!res.ok) throw new Error('PDFs load করা যায়নি')

                const data = await res.json()
                setPdfSources(data)

                if (data.length === 0) {
                    setError(
                        'এই subject-এর জন্য কোনো PDF উপলব্ধ নেই।'
                    )
                }
            } catch (err) {
                console.error(err)
                setError(
                    err instanceof Error
                        ? err.message
                        : 'PDFs load করা যায়নি'
                )
            } finally {
                setLoadingPdfs(false)
            }
        }

        fetchPdfs()
    }, [selectedSubjectId, filterClassId])

    const filteredSubjects = useMemo(() => {
        if (!filterClassId) return subjects

        return subjects.filter(
            (subject) => subject.class_id === filterClassId
        )
    }, [subjects, filterClassId])

    const selectedSubject = subjects.find(
        (subject) => subject.id === selectedSubjectId
    )

    const selectedClass = classes.find(
        (item) =>
            item.id ===
            (selectedSubject?.class_id ?? filterClassId)
    )

    const selectedPdf = pdfSources.find(
        (pdf) => pdf.id === selectedPdfId
    )

    // --------------------------------------------------
    // Image compression
    // --------------------------------------------------

    async function compressImage(file: File): Promise<{
        base64: string
        preview: string
    }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = () => {
                const image = new Image()

                image.onload = () => {
                    let width = image.width
                    let height = image.height

                    // Resize large images
                    if (
                        width > MAX_IMAGE_WIDTH ||
                        height > MAX_IMAGE_HEIGHT
                    ) {
                        const ratio = Math.min(
                            MAX_IMAGE_WIDTH / width,
                            MAX_IMAGE_HEIGHT / height
                        )

                        width = Math.round(width * ratio)
                        height = Math.round(height * ratio)
                    }

                    const canvas = document.createElement('canvas')

                    canvas.width = width
                    canvas.height = height

                    const context = canvas.getContext('2d')

                    if (!context) {
                        reject(
                            new Error(
                                'Image processing শুরু করা যায়নি।'
                            )
                        )
                        return
                    }

                    // White background for PNG transparency
                    context.fillStyle = '#ffffff'
                    context.fillRect(
                        0,
                        0,
                        width,
                        height
                    )

                    context.drawImage(
                        image,
                        0,
                        0,
                        width,
                        height
                    )

                    // Convert to compressed JPEG
                    const compressedDataUrl =
                        canvas.toDataURL(
                            'image/jpeg',
                            JPEG_QUALITY
                        )

                    const base64 =
                        compressedDataUrl.split(',')[1]

                    if (!base64) {
                        reject(
                            new Error(
                                'Image থেকে base64 তৈরি করা যায়নি।'
                            )
                        )
                        return
                    }

                    resolve({
                        base64,
                        preview: compressedDataUrl,
                    })
                }

                image.onerror = () => {
                    reject(
                        new Error(
                            'ছবিটি পড়া যায়নি। অন্য ছবি দিয়ে চেষ্টা করো।'
                        )
                    )
                }

                image.src = reader.result as string
            }

            reader.onerror = () => {
                reject(
                    new Error(
                        'ছবি পড়ার সময় সমস্যা হয়েছে।'
                    )
                )
            }

            reader.readAsDataURL(file)
        })
    }

    // --------------------------------------------------
    // Image selection
    // --------------------------------------------------

    async function handleImageChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = e.target.files?.[0]

        if (!file) return

        setError(null)

        // Validate type
        if (!file.type.startsWith('image/')) {
            setError(
                'শুধু JPG, PNG বা WebP image upload করতে পারবে।'
            )

            e.target.value = ''
            return
        }

        // Validate original file size
        if (file.size > MAX_FILE_SIZE) {
            setError(
                'ছবির size 6 MB-এর বেশি। ছোট ছবি upload করো।'
            )

            e.target.value = ''
            return
        }

        try {
            const result = await compressImage(file)

            setImageBase64(result.base64)
            setImagePreview(result.preview)

        } catch (err) {
            console.error(
                'Image processing error:',
                err
            )

            setImageBase64(null)
            setImagePreview(null)

            setError(
                err instanceof Error
                    ? err.message
                    : 'ছবি process করা যায়নি।'
            )

            e.target.value = ''
        }
    }

    // --------------------------------------------------
    // AI Extraction
    // --------------------------------------------------

    async function handleExtract() {
        if (!imageBase64) {
            setError('আগে একটি syllabus image upload করো।')
            return
        }

        if (!selectedSubjectId) {
            setError('Subject বেছে নাও।')
            return
        }

        if (!selectedSubject) {
            setError('Selected subject পাওয়া যায়নি।')
            return
        }

        setError(null)
        setExtracting(true)

        try {
            const response = await fetch(
                '/api/admin/extract-syllabus',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageBase64,
                        subjectName: selectedSubject.name,
                        classLevel:
                            selectedClass?.name ??
                            filterClassId,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data?.error ||
                    'Syllabus extraction failed.'
                )
                return
            }

            if (
                !data?.chapters ||
                !Array.isArray(data.chapters) ||
                data.chapters.length === 0
            ) {
                setError(
                    'কোনো Chapter পাওয়া যায়নি। আরো clear syllabus image দিয়ে চেষ্টা করো।'
                )
                return
            }

            const normalizedChapters: ExtractedChapter[] =
                data.chapters.map(
                    (
                        chapter: {
                            title?: string
                            title_bn?: string
                            lessons?: ExtractedLesson[]
                        }
                    ) => ({
                        title:
                            chapter.title?.trim() ||
                            'Untitled Chapter',

                        title_bn:
                            chapter.title_bn?.trim() ||
                            'অজানা অধ্যায়',

                        lessons: Array.isArray(
                            chapter.lessons
                        )
                            ? chapter.lessons
                                .filter(
                                    (lesson) =>
                                        lesson &&
                                        lesson.title_bn
                                )
                                .map(
                                    (lesson) => ({
                                        title:
                                            lesson.title?.trim() ||
                                            lesson.title_bn,

                                        title_bn:
                                            lesson.title_bn.trim(),
                                    })
                                )
                            : [],

                        selected: true,
                        expanded: true,
                    })
                )

            setChapters(normalizedChapters)

            setStep('preview')
        } catch (err) {
            console.error(
                'Extraction error:',
                err
            )

            setError(
                'Server-এর সাথে যোগাযোগ করা যায়নি। আবার চেষ্টা করো।'
            )
        } finally {
            setExtracting(false)
        }
    }

    // --------------------------------------------------
    // Slug generator
    // --------------------------------------------------

    function generateSlug(
        text: string,
        fallback: string,
        index: number
    ) {
        const slug = text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        return (
            slug ||
            `${fallback}-${Date.now()}-${index}`
        )
    }

    // --------------------------------------------------
    // Save Chapter + Lessons
    // --------------------------------------------------

    async function handleSave() {
        const selectedChapters =
            chapters.filter(
                (chapter) => chapter.selected
            )

        if (selectedChapters.length === 0) {
            setError(
                'কমপক্ষে একটি Chapter select করো।'
            )
            return
        }

        if (!selectedSubject) {
            setError(
                'Subject information পাওয়া যায়নি।'
            )
            return
        }

        setSaving(true)
        setStep('saving')
        setError(null)

        let totalChapters = 0
        let totalLessons = 0

        const failedItems: string[] = []

        try {
            for (
                let i = 0;
                i < selectedChapters.length;
                i++
            ) {
                const chapter =
                    selectedChapters[i]

                const chapterSlug =
                    generateSlug(
                        chapter.title,
                        `chapter-${i + 1}`,
                        i
                    )

                // ------------------------------------------
                // Create Chapter
                // ------------------------------------------

                const chapterResponse =
                    await fetch(
                        '/api/admin/curriculum/chapters',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type':
                                    'application/json',
                            },
                            body: JSON.stringify({
                                subjectId:
                                    selectedSubjectId,

                                classId:
                                    selectedSubject.class_id,

                                title:
                                    chapter.title,

                                titleBn:
                                    chapter.title_bn,

                                slug:
                                    chapterSlug,

                                description:
                                    null,

                                chapterNumber:
                                    i + 1,

                                orderIndex: i,
                            }),
                        }
                    )

                const chapterData =
                    await chapterResponse.json()

                if (
                    !chapterResponse.ok ||
                    !chapterData?.id
                ) {
                    failedItems.push(
                        `Chapter: ${chapter.title_bn}`
                    )

                    continue
                }

                totalChapters++

                // ------------------------------------------
                // Create Lessons
                // ------------------------------------------

                for (
                    let j = 0;
                    j < chapter.lessons.length;
                    j++
                ) {
                    const lesson =
                        chapter.lessons[j]

                    const lessonSlug =
                        generateSlug(
                            lesson.title,
                            `lesson-${i + 1}-${j + 1}`,
                            j
                        )

                    const lessonResponse =
                        await fetch(
                            '/api/admin/curriculum/lessons',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type':
                                        'application/json',
                                },
                                body: JSON.stringify({
                                    chapterId:
                                        chapterData.id,

                                    subjectId:
                                        selectedSubjectId,

                                    classId:
                                        selectedSubject.class_id,

                                    title:
                                        lesson.title,

                                    titleBn:
                                        lesson.title_bn,

                                    slug:
                                        lessonSlug,

                                    lessonNumber:
                                        j + 1,

                                    orderIndex: j,
                                }),
                            }
                        )

                    if (!lessonResponse.ok) {
                        failedItems.push(
                            `Lesson: ${lesson.title_bn}`
                        )

                        continue
                    }

                    totalLessons++
                }
            }

            setSavedCount({
                chapters: totalChapters,
                lessons: totalLessons,
            })

            // সব fail হলে done দেখানো হবে না
            if (
                totalChapters === 0 &&
                failedItems.length > 0
            ) {
                setStep('preview')

                setError(
                    `কোনো Chapter save হয়নি। ${failedItems.length} টি item fail করেছে।`
                )

                return
            }

            setStep('done')

            if (failedItems.length > 0) {
                console.warn(
                    'Some curriculum items failed:',
                    failedItems
                )
            }
        } catch (err) {
            console.error(
                'Save curriculum error:',
                err
            )

            setStep('preview')

            setError(
                'Database-এ save করার সময় সমস্যা হয়েছে।'
            )
        } finally {
            setSaving(false)
        }
    }

    // --------------------------------------------------
    // Chapter controls
    // --------------------------------------------------

    function toggleChapter(index: number) {
        setChapters((previous) =>
            previous.map((chapter, i) =>
                i === index
                    ? {
                        ...chapter,
                        selected:
                            !chapter.selected,
                    }
                    : chapter
            )
        )
    }

    function toggleExpand(index: number) {
        setChapters((previous) =>
            previous.map((chapter, i) =>
                i === index
                    ? {
                        ...chapter,
                        expanded:
                            !chapter.expanded,
                    }
                    : chapter
            )
        )
    }

    // --------------------------------------------------
    // Reset
    // --------------------------------------------------

    function reset() {
        setStep('setup')
        setChapters([])
        setImageBase64(null)
        setImagePreview(null)
        setSelectedSubjectId('')
        setFilterClassId('')
        setError(null)

        setSavedCount({
            chapters: 0,
            lessons: 0,
        })

        if (fileRef.current) {
            fileRef.current.value = ''
        }
    }

    const selectedChapterCount =
        chapters.filter(
            (chapter) => chapter.selected
        ).length

    const totalExtractedLessons =
        chapters.reduce(
            (total, chapter) =>
                total + chapter.lessons.length,
            0
        )

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <main className="min-h-screen bg-[#030711] px-3 py-5 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Header */}

                <header className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-xl border border-emerald-400/55 bg-emerald-400/10">
                        <Wand2 className="size-6 text-emerald-300" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            AI Curriculum{' '}
                            <span className="bg-linear-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                                Import
                            </span>
                        </h1>

                        <p className="mt-0.5 text-sm text-slate-400">
                            NCTB syllabus image upload করো —
                            AI automatically Chapter ও Lesson
                            extract করবে।
                        </p>
                    </div>
                </header>

                {/* Steps */}

                <div className="flex items-center gap-2">
                    {['Setup', 'Preview', 'Done'].map(
                        (label, index) => {
                            const stepMap = {
                                setup: 0,
                                preview: 1,
                                saving: 1,
                                done: 2,
                            }

                            const current =
                                stepMap[step]

                            return (
                                <div
                                    key={label}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className={`grid size-7 place-items-center rounded-full text-xs font-bold transition ${current >= index
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white/10 text-white/40'
                                            }`}
                                    >
                                        {current >
                                            index ? (
                                            <Check className="size-4" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>

                                    <span
                                        className={`text-sm ${current >=
                                                index
                                                ? 'text-white'
                                                : 'text-white/40'
                                            }`}
                                    >
                                        {label}
                                    </span>

                                    {index < 2 && (
                                        <div
                                            className={`h-px w-8 ${current >
                                                    index
                                                    ? 'bg-emerald-500'
                                                    : 'bg-white/10'
                                                }`}
                                        />
                                    )}
                                </div>
                            )
                        }
                    )}
                </div>

                {/* ------------------------------------ */}
                {/* STEP 1 */}
                {/* ------------------------------------ */}

                {step === 'setup' && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="space-y-5"
                    >

                        {/* Subject */}

                        <div className="rounded-2xl border border-slate-700/80 bg-[#0b1223] p-6 space-y-4">

                            <h2 className="font-bold text-white flex items-center gap-2">
                                <BookOpen className="size-5 text-emerald-300" />
                                Subject নির্বাচন করো
                            </h2>

                            <div>
                                <label className="text-sm text-slate-400">
                                    Class
                                </label>

                                <select
                                    value={
                                        filterClassId
                                    }
                                    onChange={(e) => {
                                        setFilterClassId(
                                            e.target.value
                                        )
                                        setSelectedSubjectId(
                                            ''
                                        )
                                    }}
                                    className={`mt-2 ${inputClass}`}
                                >
                                    <option value="">
                                        Class বেছে নাও
                                    </option>

                                    {classes.map(
                                        (item) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-slate-400">
                                    Subject *
                                </label>

                                <select
                                    value={
                                        selectedSubjectId
                                    }
                                    onChange={(e) =>
                                        setSelectedSubjectId(
                                            e.target
                                                .value
                                        )
                                    }
                                    className={`mt-2 ${inputClass}`}
                                    required
                                >
                                    <option value="">
                                        Subject বেছে নাও
                                    </option>

                                    {filteredSubjects.map(
                                        (subject) => (
                                            <option
                                                key={
                                                    subject.id
                                                }
                                                value={
                                                    subject.id
                                                }
                                            >
                                                {
                                                    subject.name_bn
                                                }{' '}
                                                (
                                                {
                                                    subject.name
                                                }
                                                )
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Image */}

                        <div className="rounded-2xl border border-slate-700/80 bg-[#0b1223] p-6 space-y-4">

                            <h2 className="font-bold text-white flex items-center gap-2">
                                <Upload className="size-5 text-emerald-300" />
                                NCTB Book-এর ছবি upload করো
                            </h2>

                            <div
                                onClick={() =>
                                    fileRef.current?.click()
                                }
                                className="cursor-pointer rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-400/50 transition p-8 text-center"
                            >
                                {imagePreview ? (
                                    <img
                                        src={
                                            imagePreview
                                        }
                                        alt="Syllabus preview"
                                        className="max-h-80 max-w-full mx-auto rounded-xl object-contain"
                                    />
                                ) : (
                                    <div>
                                        <ImageIcon className="size-10 mx-auto text-slate-500 mb-3" />

                                        <p className="text-white font-medium">
                                            Click করে ছবি বেছে নাও
                                        </p>

                                        <p className="text-slate-500 text-sm mt-1">
                                            JPG, PNG, WebP —
                                            max 6MB
                                        </p>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={
                                    handleImageChange
                                }
                            />

                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageBase64(
                                            null
                                        )
                                        setImagePreview(
                                            null
                                        )

                                        if (
                                            fileRef.current
                                        ) {
                                            fileRef.current.value =
                                                ''
                                        }
                                    }}
                                    className="text-sm text-red-400 hover:text-red-300 transition"
                                >
                                    ছবি সরাও
                                </button>
                            )}
                        </div>

                        {/* Error */}

                        {error && (
                            <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                                <AlertCircle className="size-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Extract */}

                        <button
                            type="button"
                            onClick={
                                handleExtract
                            }
                            disabled={
                                extracting ||
                                !imageBase64 ||
                                !selectedSubjectId
                            }
                            className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {extracting ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    AI Extract করছে...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="size-5" />
                                    AI দিয়ে Extract করো
                                </>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* ------------------------------------ */}
                {/* STEP 2 */}
                {/* ------------------------------------ */}

                {step === 'preview' && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="space-y-5"
                    >

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-white text-lg">
                                    {chapters.length}{' '}
                                    টি Chapter
                                    extract হয়েছে
                                </h2>

                                <p className="text-slate-400 text-sm">
                                    Subject:{' '}
                                    {
                                        selectedSubject?.name_bn
                                    }{' '}
                                    | Class:{' '}
                                    {
                                        selectedClass?.name
                                    }
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                    মোট{' '}
                                    {
                                        totalExtractedLessons
                                    }{' '}
                                    টি Lesson পাওয়া গেছে
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={reset}
                                className="text-sm text-slate-400 hover:text-white transition flex items-center gap-1"
                            >
                                <X className="size-4" />
                                Reset
                            </button>
                        </div>

                        {/* Chapters */}

                        <div className="space-y-3">
                            {chapters.map(
                                (
                                    chapter,
                                    index
                                ) => (
                                    <div
                                        key={index}
                                        className={`rounded-2xl border transition ${chapter.selected
                                                ? 'border-emerald-500/40 bg-emerald-500/5'
                                                : 'border-slate-700/60 bg-[#0b1223] opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 p-4">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    chapter.selected
                                                }
                                                onChange={() =>
                                                    toggleChapter(
                                                        index
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-white/10 bg-slate-800 text-emerald-500"
                                            />

                                            <div className="flex-1">
                                                <p className="font-bold text-white">
                                                    {
                                                        chapter.title_bn
                                                    }
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {
                                                        chapter.title
                                                    }{' '}
                                                    •{' '}
                                                    {
                                                        chapter
                                                            .lessons
                                                            .length
                                                    }{' '}
                                                    lessons
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleExpand(
                                                        index
                                                    )
                                                }
                                                className="text-slate-400 hover:text-white transition"
                                            >
                                                {chapter.expanded ? (
                                                    <ChevronUp className="size-5" />
                                                ) : (
                                                    <ChevronDown className="size-5" />
                                                )}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {chapter.expanded && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: 'auto',
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 space-y-2">

                                                        {chapter.lessons.length ===
                                                            0 ? (
                                                            <p className="text-sm text-slate-500 px-3 py-2">
                                                                কোনো Lesson পাওয়া যায়নি।
                                                            </p>
                                                        ) : (
                                                            chapter.lessons.map(
                                                                (
                                                                    lesson,
                                                                    lessonIndex
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            lessonIndex
                                                                        }
                                                                        className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2"
                                                                    >
                                                                        <span className="text-xs text-slate-500 w-6">
                                                                            {
                                                                                lessonIndex +
                                                                                1
                                                                            }
                                                                            .
                                                                        </span>

                                                                        <div>
                                                                            <p className="text-sm text-white">
                                                                                {
                                                                                    lesson.title_bn
                                                                                }
                                                                            </p>

                                                                            <p className="text-xs text-slate-500">
                                                                                {
                                                                                    lesson.title
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Error */}

                        {error && (
                            <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                                <AlertCircle className="size-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Save */}

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={
                                saving ||
                                selectedChapterCount ===
                                0
                            }
                            className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg transition hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Database এ save হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Check className="size-5" />
                                    {selectedChapterCount}{' '}
                                    টি Chapter +{' '}
                                    {
                                        totalExtractedLessons
                                    }{' '}
                                    টি Lesson Save করো
                                </>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* ------------------------------------ */}
                {/* STEP 3 */}
                {/* ------------------------------------ */}

                {step === 'done' && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.95,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        className="text-center py-16"
                    >
                        <div className="grid size-20 place-items-center rounded-full bg-emerald-500/20 border border-emerald-500/30 mx-auto mb-6">
                            <Check className="size-10 text-emerald-400" />
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2">
                            Alhamdulillah! সফলভাবে
                            import হয়েছে!
                        </h2>

                        <p className="text-slate-400 mb-8">
                            {savedCount.chapters} টি
                            Chapter এবং{' '}
                            {savedCount.lessons} টি Lesson
                            database এ save হয়েছে।
                        </p>

                        <div className="flex gap-3 justify-center">
                            <Link
                                href="/dashboard/admin/curriculum/chapters"
                                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition"
                            >
                                Chapters দেখো
                            </Link>

                            <button
                                type="button"
                                onClick={reset}
                                className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition"
                            >
                                আবার Import করো
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    )
}