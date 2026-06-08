"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { cx } from "@/utils/cx";

const supabase = createClient();

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthSplitLayout>
                <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/70 p-6 text-center shadow-xl backdrop-blur-xl sm:p-8">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success-100">
                        <Mail01 className="size-8 text-success-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">Check your email</h1>
                    <p className="mt-3 text-sm text-tertiary">
                        We've sent a password reset link to <span className="font-medium text-secondary">{email}</span>
                    </p>
                    <Link
                        href="/login"
                        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                        <ArrowLeft className="size-4" />
                        Back to sign in
                    </Link>
                </div>
            </AuthSplitLayout>
        );
    }

    return (
        <AuthSplitLayout>
            <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl sm:p-8">
                {/* Back Button */}
                <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-tertiary hover:text-secondary">
                    <ArrowLeft className="size-4" />
                    Back to sign in
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-primary">Forgot password?</h1>
                    <p className="mt-2 text-sm text-tertiary">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-secondary">Email</label>
                        <div className="relative">
                            <Mail01 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-quaternary" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full rounded-lg border border-primary bg-primary py-3 pl-10 pr-4 text-primary placeholder:text-quaternary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={cx(
                            "w-full rounded-lg py-3 font-semibold text-white transition-colors",
                            loading ? "bg-gray-400" : "bg-brand-600 hover:bg-brand-700"
                        )}
                    >
                        {loading ? "Sending..." : "Reset password"}
                    </button>
                </form>
            </div>
        </AuthSplitLayout>
    );
}
