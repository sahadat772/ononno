"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type CurriculumClass = {
    id: string;
    name: string;
};

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classItem: CurriculumClass | null;
}

export default function DeleteClassModal({
    open,
    onClose,
    onSuccess,
    classItem,
}: Props) {
    const [loading, setLoading] = useState(false);

    if (!open || !classItem) return null;

    async function handleDelete() {
        if (!classItem) return;

        try {
            setLoading(true);

            const res = await fetch(
                `/api/admin/curriculum/classes/${classItem.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Delete failed");
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-100 overflow-y-auto bg-black/70 backdrop-blur-sm px-4 py-6 sm:px-6 sm:py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="mx-auto w-full max-w-lg overflow-hidden rounded-4xl border border-red-500/20 bg-[#0f172a] shadow-2xl"
                >
                    <div className="bg-linear-to-r from-red-600 to-rose-600 p-6 text-center">
                        <div className="text-6xl">🗑️</div>

                        <h2 className="mt-4 text-2xl font-black text-white">
                            Delete Class
                        </h2>

                        <p className="text-red-100 mt-2 text-sm">
                            This action cannot be undone.
                        </p>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                            <p className="text-gray-300 text-sm">
                                Are you sure you want to delete this class?
                            </p>

                            <div className="mt-3 rounded-lg bg-black/20 p-3">
                                <p className="font-bold text-lg text-white">
                                    {classItem.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 hover:bg-white/10 transition"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={loading}
                                onClick={handleDelete}
                                className="rounded-xl bg-linear-to-r from-red-600 to-red-500 px-5 py-3 font-bold hover:scale-105 transition disabled:opacity-50"
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}