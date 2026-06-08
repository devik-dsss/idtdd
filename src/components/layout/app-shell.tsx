"use client";

import type { ReactNode } from "react";
import { BottomNavigation } from "./bottom-navigation";
import { SideNavigation } from "./side-navigation";

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-primary">
            {/* Desktop sidebar (lg+) */}
            <SideNavigation />

            {/* Content — offset by the sidebar on desktop. A comfortable centered
                column on mobile, widening on desktop so grids have room to breathe. */}
            <div className="lg:pl-64">
                <main className="mx-auto w-full max-w-md pb-20 lg:max-w-none lg:pb-0">{children}</main>
            </div>

            {/* Mobile bottom nav (hidden on lg+) */}
            <BottomNavigation />
        </div>
    );
}
