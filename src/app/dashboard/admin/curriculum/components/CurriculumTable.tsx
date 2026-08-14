'use client'

import { motion } from 'framer-motion'

import { CurriculumVersion } from '@/types/curriculum'

interface Props {
    versions: CurriculumVersion[]
}

export default function CurriculumTable({ versions }: Props) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden"
        >
            {/* Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">

                <div>

                    <h2 className="text-xl font-bold text-white">

                        Curriculum Versions

                    </h2>

                    <p className="text-sm text-gray-400 mt-1">

                        Manage all NCTB curriculum versions.

                    </p>

                </div>

            </div>

            {/* Table */}

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-white/5">

                        <tr className="text-left">

                            <th className="px-6 py-4 text-sm text-gray-400">Name</th>

                            <th className="px-6 py-4 text-sm text-gray-400">Year</th>

                            <th className="px-6 py-4 text-sm text-gray-400">Status</th>

                            <th className="px-6 py-4 text-sm text-gray-400">Active</th>

                            <th className="px-6 py-4 text-right text-sm text-gray-400">

                                Actions

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {versions.length === 0 && (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="text-center py-12 text-gray-500"
                                >
                                    No curriculum versions found.
                                </td>

                            </tr>

                        )}

                        {versions.map((version) => (

                            <tr
                                key={version.id}
                                className="border-t border-white/5 hover:bg-white/5 transition"
                            >
                                <td className="px-6 py-5">

                                    <div>

                                        <h3 className="font-semibold text-white">

                                            {version.name}

                                        </h3>

                                        <p className="text-xs text-gray-500 mt-1">

                                            {version.slug}

                                        </p>

                                    </div>

                                </td>

                                <td className="px-6 py-5 font-medium">

                                    {version.year}

                                </td>

                                <td className="px-6 py-5">

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${version.status === 'published'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : version.status === 'draft'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                            }`}
                                    >
                                        {version.status}
                                    </span>

                                </td>

                                <td className="px-6 py-5">

                                    {version.isActive ? (
                                        <span className="text-emerald-400 font-semibold">
                                            ✅ Active
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">
                                            —
                                        </span>
                                    )}

                                </td>

                                <td className="px-6 py-5">

                                    <div className="flex justify-end gap-2">

                                        <button className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">

                                            Edit

                                        </button>

                                        <button className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">

                                            Publish

                                        </button>

                                        <button className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">

                                            Delete

                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </motion.section>
    )
}