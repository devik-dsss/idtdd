"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail01, ArrowLeft } from "@untitledui/icons";
import { resendVerificationEmail } from "@/lib/supabase/auth";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { cx } from "@/utils/cx";

export default function VerifyEmailPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resent, setResent] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") || "");
    }, []);

    const handleResend = async () => {
        if (!email) return;
        setLoading(true);

        try {
            await resendVerificationEmail(email);
            setResent(true);
        } catch (err) {
            // Handle error silently
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthSplitLayout>
            <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/70 p-6 text-center shadow-xl backdrop-blur-xl sm:p-8">
                {/* Icon */}
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-brand-100">
                    <Mail01 className="size-10 text-brand-600" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-primary">Verify your email</h1>

                {/* Description */}
                <p className="mt-3 text-sm text-tertiary">
                    We've sent a verification link to{" "}
                    <span className="font-medium text-secondary">{email}</span>
                </p>

                {/* Instructions */}
                <div className="mt-6 rounded-lg bg-secondary p-4 text-left">
                    <p className="text-sm text-secondary">
                        Click the link in the email to verify your account. If you don't see it, check your spam folder.
                    </p>
                </div>

                {/* Resend Button */}
                <button
                    onClick={handleResend}
                    disabled={loading || resent}
                    className={cx(
                        "mt-6 w-full rounded-lg py-3 font-semibold transition-colors",
                        resent
                            ? "bg-success-100 text-success-700"
                            : loading
                            ? "bg-gray-200 text-gray-400"
                            : "bg-brand-600 text-white hover:bg-brand-700"
                    )}
                >
                    {resent ? "Email sent!" : loading ? "Sending..." : "Resend verification email"}
                </button>

                {/* Back to Login */}
                <Link
                    href="/login"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                    <ArrowLeft className="size-4" />
                    Back to sign in
                </Link>
            </div>
        </AuthSplitLayout>
    );
}
