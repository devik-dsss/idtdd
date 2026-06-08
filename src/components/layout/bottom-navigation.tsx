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

export function BottomNavigation() {
    const pathname = usePathname();
    const user = useUser();
    const isAdmin = isAdminEmail(user.email);
    const items = navItems.filter((item) => !item.adminOnly || isAdmin);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white lg:hidden">
            <div className="mx-auto flex h-16 max-w-md items-center justify-around">
                {items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cx(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                                isActive ? "text-[#f63d68]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
