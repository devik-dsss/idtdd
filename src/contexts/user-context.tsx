"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

interface UserContextType {
    user: User;
}

export const UserContext = createContext<UserContextType | null>(null);

export function useUser(): User {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within AuthGuard");
    }
    return context.user;
}
