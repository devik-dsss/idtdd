"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User01, Mail01, Lock01, Hash02, Building07, ChevronDown } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { cx } from "@/utils/cx";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

function EyeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

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

export default function SignUpPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [fullName, setFullName] = useState("");
    const [usn, setUsn] = useState("");
    const [branch, setBranch] = useState("");
    const [section, setSection] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check if already authenticated (use getSession for speed)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
            if (session?.user) {
                router.push("/");
            }
        });
    }, [router]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#f63d68]" />
            </div>
        );
    }

    // Don't render if user is authenticated (will redirect)
    if (user) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            // Generate username from email (before @ symbol)
            const generatedUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");

            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: generatedUsername,
                    },
                },
            });
            if (authError) throw authError;

            // Create profile
            if (authData.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: profileError } = await (supabase.from("profiles") as any).upsert({
                    id: authData.user.id,
                    email,
                    full_name: fullName,
                    username: generatedUsername,
                    usn: usn || null,
                    branch: branch || null,
                    section: section || null,
                }, { onConflict: "id" });
                if (profileError) throw profileError;
            }

            router.push("/");
        } catch (err: any) {
            // Show user-friendly error messages
            const errorMsg = err.message?.toLowerCase() || "";
            if (errorMsg.includes("duplicate") || errorMsg.includes("already exists") || errorMsg.includes("unique constraint")) {
                setError("An account with this email already exists. Please sign in instead.");
            } else if (errorMsg.includes("invalid email")) {
                setError("Please enter a valid email address.");
            } else if (errorMsg.includes("password")) {
                setError("Password must be at least 6 characters.");
            } else {
                setError("Failed to create account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthSplitLayout>
            {/* Glass Card */}
            <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl sm:p-8">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="mt-2 text-sm text-gray-500">Join the hostel food review community</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Full Name */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="relative">
                            <User01 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                                className="w-full rounded-lg border border-gray-200 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#f63d68] focus:outline-none focus:ring-1 focus:ring-[#f63d68]"
                            />
                        </div>
                    </div>

                    {/* USN / Roll No */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">USN / Roll No</label>
                        <div className="relative">
                            <Hash02 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={usn}
                                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                                placeholder="Enter your USN or Roll No"
                                required
                                className="w-full rounded-lg border border-gray-200 bg-white/50 py-3 pl-10 pr-4 text-gray-900 uppercase placeholder:text-gray-400 placeholder:normal-case focus:border-[#f63d68] focus:outline-none focus:ring-1 focus:ring-[#f63d68]"
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
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    required
                                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white/50 py-3 pl-10 pr-10 text-gray-900 focus:border-[#f63d68] focus:outline-none focus:ring-1 focus:ring-[#f63d68]"
                                >
                                    <option value="" disabled>Select</option>
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
                                    value={section}
                                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                                    required
                                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white/50 py-3 pl-4 pr-10 text-gray-900 focus:border-[#f63d68] focus:outline-none focus:ring-1 focus:ring-[#f63d68]"
                                >
                                    <option value="" disabled>Select</option>
                                    {sections.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                        <div className="relative">
                            <Mail01 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full rounded-lg border border-gray-200 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#f63d68] focus:outline-none focus:ring-1 focus:ring-[#f63d68]"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <Lock01 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                                className="w-full rounded-lg border border-gray-200 bg-white/50 py-3 pl-10 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-[#f63d68] focus:outline-none focus:ring-1 focus:ring-[#f63d68]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={cx(
                            "w-full rounded-lg py-3 font-semibold text-white transition-colors",
                            loading ? "bg-gray-400" : "bg-[#f63d68] hover:bg-[#e02d57]"
                        )}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                {/* Sign In Link */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-[#f63d68] hover:text-[#e02d57]">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthSplitLayout>
    );
}
