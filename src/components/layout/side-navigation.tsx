"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home01, Calendar, Star01, User01, Settings01 } from "@untitledui/icons";
import { useUser } from "@/contexts/user-context";
import { isAdminEmail } from "@/lib/auth/admin";
import { cx } from "@/utils/cx";

const navItems = [
    { href: "/", icon: Home01, label: "Home", adminOnly: false },
    { href: "/menu", icon: Calendar, label: "Menu", adminOnly: false },
    { href: "/reviews", icon: Star01, label: "Reviews", adminOnly: false },
    { href: "/profile", icon: User01, label: "Profile", adminOnly: false },
    { href: "/admin", icon: Settings01, label: "Admin", adminOnly: true },
];

function UtensilsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    );
}

/** Desktop-only sidebar navigation. Hidden below the `lg` breakpoint, where {@link BottomNavigation} takes over. */
export function SideNavigation() {
    const pathname = usePathname();
    const user = useUser();
    const isAdmin = isAdminEmail(user.email);
    const items = navItems.filter((item) => !item.adminOnly || isAdmin);

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-6">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#f63d68] text-white">
                    <UtensilsIcon className="size-5" />
                </span>
                <span className="text-lg font-bold text-gray-900">Hostel Mess</span>
            </div>

            {/* Nav links */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cx(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive ? "bg-[#f63d68]/10 text-[#f63d68]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
