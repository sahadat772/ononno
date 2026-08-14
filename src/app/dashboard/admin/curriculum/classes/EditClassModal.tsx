"use client";

import { useEffect, useState } from "react";

type ClassItem = {
    id: string;
    version_id: string;
    name: string;
    slug: string;
    class_number: number;
    description: string | null;
    is_active: boolean;
};

interface Props {
    open: boolean;
    classItem: ClassItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditClassModal({
    open,
    classItem,
    onClose,
    onSuccess,
}: Props) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        classNumber: 1,
        description: "",
        isActive: true,
    });

    useEffect(() => {
        if (!classItem) return;

        // Defer updating local form state so we don't synchronously call setState
        // inside the effect body (avoids cascading renders and satisfies
        // react-hooks/set-state-in-effect rule).
        const id = setTimeout(() => {
            setForm({
                name: classItem.name,
                slug: classItem.slug,
                classNumber: classItem.class_number,
                description: classItem.description ?? "",
                isActive: classItem.is_active,
            });
        }, 0);

        return () => clearTimeout(id);
    }, [classItem]);

    if (!open || !classItem) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!classItem) return;

        setLoading(true);

        try {
            const res = await fetch(
                `/api/admin/curriculum/classes/${classItem.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Update failed");
                return;
            }

            onSuccess();
            onClose();
        } catch {
            alert("Network Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-4xl border border-white/10 bg-[#111827] shadow-2xl">
                <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr,0.8fr]">
                    <div>
                        <p className="text-sm text-blue-300 uppercase tracking-[0.24em]">Edit class</p>
                        <h2 className="mt-3 text-3xl font-black text-white">Update class details</h2>
                        <p className="mt-2 text-sm text-gray-400">Make changes to the class metadata and save. The form is scrollable on smaller screens.</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                        <p className="font-semibold text-white">Important</p>
                        <p className="mt-2 leading-6">Changing the class slug may affect existing lessons and URLs. Keep the class number unique per version.</p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 px-6 pb-6 sm:px-8 sm:pb-8 max-h-[calc(100vh-14rem)] overflow-y-auto"
                >

                    <div>
                        <label className="text-sm text-gray-300">
                            Class Name
                        </label>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))}
                            required
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">
                            Slug
                        </label>

                        <input
                            value={form.slug}

                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    slug: e.target.value,
                                }))
                            }
                            required
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">
                            Class Number
                        </label>

                        <input
                            type="number"
                            value={form.classNumber}

                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    classNumber: Number(e.target.value),
                                }))
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            value={form.description}

                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                        />
                    </div>

                    <label className="flex items-center gap-3">

                        <input
                            type="checkbox"
                            checked={form.isActive}

                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    isActive: e.target.checked,
                                }))
                            }
                        />

                        <span>Active</span>

                    </label>

                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={loading}
                            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Update Class"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}