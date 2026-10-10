"use client";

import React from "react";
import MSWProvider from "@/src/providers/MSWProvider";
import AuthProvider from "@/src/context/AuthContext";
import TanStackQueryProvider from "../providers/TanStackQueryProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <React.StrictMode>
            <TanStackQueryProvider>
                <MSWProvider>
                    <AuthProvider>{children}</AuthProvider>
                </MSWProvider>
            </TanStackQueryProvider>
        </React.StrictMode>
    );
}
