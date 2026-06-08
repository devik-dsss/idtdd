"use client";

import type { ReactNode } from "react";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <RouteProvider>
            <Theme>{children}</Theme>
        </RouteProvider>
    );
}
