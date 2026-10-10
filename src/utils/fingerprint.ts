export const getFingerprint = (): string => {
    let fingerprint: string | null = null;

    if (typeof window !== "undefined" && window.localStorage) {
        fingerprint = localStorage.getItem("fingerprint");

        if (!fingerprint || fingerprint.length !== 32) {
            fingerprint = Array.from({ length: 32 }, () =>
                Math.floor(Math.random() * 16).toString(16),
            ).join("");
            localStorage.setItem("fingerprint", fingerprint);
        }
    }

    return fingerprint || "";
};
