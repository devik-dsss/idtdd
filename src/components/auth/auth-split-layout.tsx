import type { ReactNode } from "react";

function UtensilsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    );
}

/**
 * Responsive split-screen shell for the auth pages.
 * Mobile: single column — the grid + accent-blob background with `children` centered.
 * Desktop (lg+): a branded panel on the left and `children` on the right.
 */
export function AuthSplitLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col lg:flex-row">
            {/* Brand panel — desktop only */}
            <div className="relative hidden overflow-hidden bg-[#f63d68] lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
                {/* Decorative blobs + grid texture */}
                <div className="absolute -left-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "linear-gradient(#ffffff80 1px, transparent 1px), linear-gradient(90deg, #ffffff80 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Logo lockup */}
                <div className="relative flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                        <UtensilsIcon className="size-5 text-white" />
                    </span>
                    <span className="text-lg font-bold text-white">Hostel Mess</span>
                </div>

                {/* Tagline */}
                <div className="relative max-w-md">
                    <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">Rate every meal. Improve every plate.</h2>
                    <p className="mt-4 text-base text-white/80">Review your hostel mess food, share feedback, and help make the menu better.</p>
                </div>

                {/* Footer */}
                <div className="relative text-sm text-white/60">&copy; {new Date().getFullYear()} Hostel Mess Food Review</div>
            </div>

            {/* Content panel */}
            <div
                className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12 lg:px-8"
                style={{
                    backgroundImage: "linear-gradient(#e5e7eb4d 1px, transparent 1px), linear-gradient(90deg, #e5e7eb4d 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            >
                {/* Accent blobs — mobile only (the desktop accent lives in the brand panel) */}
                <div className="absolute -left-20 -top-20 size-64 rounded-full bg-[#f63d68]/20 blur-3xl lg:hidden" />
                <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-[#f63d68]/20 blur-3xl lg:hidden" />

                {children}
            </div>
        </div>
    );
}
