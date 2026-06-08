"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, User01, AtSign, Mail01, Hash02, Building07, ChevronDown } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import type { Profile } from "@/lib/supabase/types";

const sections = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A-Z

const branches = [
    "Computer Science (CSE)",
    "Information Science (ISE)",
    "Artificial Intelligence & Data Science (AIDS)",
    "Cybersecurity",
    "Electronics & Communication (ECE)",
    "Electrical & Electronics (EEE)",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Aerospace Engineering",
    "Automobile Engineering",
    "Industrial Engineering",
    "Mining Engineering",
    "Other",
];

const supabase = createClient();

export default function EditProfilePage() {
    const router = useRouter();
    const user = useUser();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        email: "",
        usn: "",
        branch: "",
        section: "",
    });

    // Fetch profile
    useEffect(() => {
        supabase.from("profiles").select("*").eq("id", user.id).single()
            .then(({ data }: { data: Profile | null }) => {
                setProfile(data);
                if (data) {
                    setFormData({
                        full_name: data.full_name || "",
                        username: data.username || "",
                        email: data.email || "",
                        usn: data.usn || "",
                        branch: data.branch || "",
                        section: data.section || "",
                    });
                } else {
                    setFormData(prev => ({
                        ...prev,
                        email: user.email || "",
                    }));
                }
                setLoading(false);
            });
    }, [user.id, user.email]);

    const handleSave = async () => {
        setError(null);
        setSaving(true);

        // Only update editable fields (USN, Branch, Section)
        const updateData = {
            usn: formData.usn || null,
            branch: formData.branch || null,
            section: formData.section || null,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
            .from("profiles")
            .update(updateData)
            .eq("id", user.id);

        setSaving(false);

        if (updateError) {
            setError("Failed to save profile. Please try again.");
            return;
        }

        router.push("/profile");
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-white lg:mx-auto lg:max-w-2xl">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-gray-100">
                    <X className="size-5 text-gray-700" />
                </button>
                <h1 className="font-semibold text-gray-900">Edit Profile</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:bg-gray-300"
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </header>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
                    {error}
                </div>
            )}

            {/* Form */}
            <div className="flex-1 px-4 pb-24 pt-4">
                {/* Personal Information (Read-only) */}
                <div className="mb-6">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Personal Information</h2>
                    <p className="mb-3 text-xs text-gray-400">These fields cannot be changed</p>

                    <div className="space-y-4">
                        {/* Full Name - Read Only */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <User01 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-500"
                                />
                            </div>
                        </div>

                        {/* Username - Read Only */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Username</label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-500"
                                />
                            </div>
                        </div>

                        {/* Email - Read Only */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail01 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="mb-6">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Academic Information</h2>

                    <div className="space-y-4">
                        {/* USN / Roll No */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">USN / Roll No</label>
                            <div className="relative">
                                <Hash02 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.usn}
                                    onChange={(e) => handleChange("usn", e.target.value.toUpperCase())}
                                    placeholder="Enter your USN or Roll No"
                                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 uppercase placeholder:text-gray-400 placeholder:normal-case focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                            </div>
                        </div>

                        {/* Branch and Section Row */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Branch */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Branch</label>
                                <div className="relative">
                                    <Building07 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={formData.branch}
                                        onChange={(e) => handleChange("branch", e.target.value)}
                                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-10 text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    >
                                        <option value="">Select</option>
                                        {branches.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Section */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Section</label>
                                <div className="relative">
                                    <select
                                        value={formData.section}
                                        onChange={(e) => handleChange("section", e.target.value.toUpperCase())}
                                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-10 text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    >
                                        <option value="">Select</option>
                                        {sections.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
