"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { isAdminEmail } from "@/lib/auth/admin";

/**
 * Restricts the entire /admin section to allowed admin emails.
 * Non-admins are redirected home and never see admin content.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const user = useUser();
    const allowed = isAdminEmail(user.email);

    useEffect(() => {
        if (!allowed) {
            router.replace("/");
        }
    }, [allowed, router]);

    if (!allowed) {
        return null;
    }

    return <>{children}</>;
}
