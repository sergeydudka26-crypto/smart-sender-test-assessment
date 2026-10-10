"use client";

import { useAuth } from "@/src/context/AuthContext";
import { getUsers } from "@/src/data/data";
import { ApiClientError } from "@/src/mocks/ApiClientError";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { user, login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace("/webhooks");
        }
    }, [user, router]);

    const defaultUser = getUsers()[0];

    function autoFillHandler() {
        setEmail(defaultUser.email);
        setPassword(defaultUser.password);
    }

    async function loginSubmitHandler(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setErrorMessage(null);
        setErrors({});

        try {
            const res = await login(email, password);
        } catch (error: unknown) {
            if (error instanceof ApiClientError) {
                if (error.payload) {
                    setErrors(error.payload);
                } else {
                    setErrorMessage(error.message);
                }
            } else if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("An unexpected error occurred during login.");
            }
        }
    }

    return (
        <form onSubmit={loginSubmitHandler}>
            <h1 className="font-bold block my-4 text-xl">Login</h1>

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 rounded text-sm">
                    {errorMessage}
                </div>
            )}

            <label className="my-3 block">
                Email :{" "}
                <input
                    name="email"
                    className="border border-gray-300 rounded-md"
                    type="email"
                    autoComplete="off"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email?.map((message, i) => (
                    <p key={i} className="text-red-500 text-xs mt-1">
                        {message}
                    </p>
                ))}
            </label>

            <label className="my-3 block">
                Password :{" "}
                <input
                    name="password"
                    className="border border-gray-300 rounded-md"
                    type="password"
                    autoComplete="off"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password?.map((message, i) => (
                    <p key={i} className="text-red-500 text-xs mt-1">
                        {message}
                    </p>
                ))}
            </label>

            <div className="my-3">
                <p className="text-gray-500 text-xs mt-1">
                    For testing, you can use the following credentials:
                </p>
                <p className="text-gray-500 text-xs mt-1">
                    Email: {defaultUser.email}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                    Password: {defaultUser.password}
                </p>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={autoFillHandler}
                    className="border border-blue-300 rounded-md px-2 py-1 text-xs cursor-pointer"
                    type="button"
                >
                    {" "}
                    Auto fill{" "}
                </button>
                <button
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs cursor-pointer"
                    type="submit"
                >
                    Login
                </button>
            </div>
        </form>
    );
}
