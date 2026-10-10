"use client";

import { useEffect, useState } from "react";

let mockingPromise: Promise<void> | null = null;

async function enableMocking(): Promise<void> {
    if (typeof window === "undefined") {
        return;
    }

    if (!mockingPromise) {
        mockingPromise = (async () => {
            try {
                const { worker } = await import("../mocks/browser");
                await worker?.start({
                    serviceWorker: {
                        url: "/mockServiceWorker.js",
                    },
                });
            } catch (error: unknown) {
                console.error("MSW initialization error:", error);
            }
        })();
    }

    return mockingPromise;
}

export default function MSWProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        enableMocking().then(() => setIsReady(true));
    }, []);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}
