"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { ApiClient } from "../utils/apiClient";
import { getFingerprint } from "../utils/fingerprint";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    login: (email: User["email"], password: User["password"]) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const login = async (email: User["email"], password: User["password"]) => {
        const loginResult = await ApiClient.request<{
            device_session_token: string;
        }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
                fingerprint: getFingerprint(),
            }),
            headers: {
                "X-Captcha-Token": "smart-sender-test-captcha-token",
            },
        });

        const deviceSessionToken = loginResult.device_session_token;
        const fingerprint = getFingerprint();

        await ApiClient.request("/auth/token/issue", {
            method: "POST",
            body: JSON.stringify({
                device_session_token: deviceSessionToken,
                fingerprint,
            }),
        });

        const userData = await ApiClient.request<User>("/v1/me", {
            method: "GET",
        });
        setUser(userData);
    };

    const logout = async () => {
        await ApiClient.fetchRevoke();
        setUser(null);
        if (typeof window !== "undefined") {
            router.push("/login");
        }
    };

    useEffect(() => {
        const currentPage = window.location.pathname;

        if (!user && currentPage !== "/login") {
            router.push("/login");
        }
    }, [user]);

    useEffect(() => {
        const currentPage = window.location.pathname;

        if (!user && currentPage !== "/login") {
            ApiClient.request<User>("/v1/me", {
                method: "GET",
            }).then((userData) => {
                setUser(userData);
            });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
