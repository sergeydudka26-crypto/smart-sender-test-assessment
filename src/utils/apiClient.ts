import { ApiClientError } from "../mocks/ApiClientError";
import { ApiErrorResponse } from "../mocks/errorResponse";
import { getFingerprint } from "./fingerprint";

let csrfPromise: Promise<string> | null = null;
let rotatePromise: Promise<void> | null = null;

export const ApiClient = {
    async _fetch(url: string, options?: RequestInit) {
        return await fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        });
    },

    async request<T>(
        url: string,
        options?: RequestInit,
        skipAuthRetry: boolean = false,
    ): Promise<T> {
        let response = await this._fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
                "X-CSRF-TOKEN": await this.fetchCsrfToken(),
            },
        });

        if (response.status === 401 && url !== "/auth/login") {
            if (!skipAuthRetry) {
                await this.fetchRotate();
                return await this.request(url, options, true);
            } else {
                await this.fetchRevoke();
                throw new ApiClientError(401, "AuthenticationException");
            }
        }

        if (response.status > 400) {
            let result;
            try {
                result = (await response.json()) as ApiErrorResponse;
            } catch {
                throw new ApiClientError(
                    response.status,
                    `Request failed with status ${response.status}`,
                );
            }

            throw new ApiClientError(
                response.status,
                result.error.message,
                result.error.type,
                result.error.payload,
            );
        }

        if (!response.ok) {
            let errorBody: ApiErrorResponse | null = null;
            try {
                errorBody = await response.json();
            } catch {
                throw new ApiClientError(
                    response.status,
                    `Request failed with status ${response.status}`,
                );
            }

            if (errorBody && errorBody.error) {
                throw new ApiClientError(
                    response.status,
                    errorBody.error.message ||
                        `Request failed with status ${response.status}`,
                    errorBody.error.type,
                    errorBody.error.payload,
                );
            }

            throw new ApiClientError(
                response.status,
                `Request failed with status ${response.status}`,
            );
        }

        return response.json();
    },

    async fetchCsrfToken(): Promise<string> {
        if (!csrfPromise) {
            csrfPromise = (async () => {
                try {
                    const response = await this._fetch("/csrf");
                    const token = response.headers.get("X-CSRF-TOKEN") || "";
                    return token;
                } finally {
                    csrfPromise = null;
                }
            })();
        }

        return csrfPromise;
    },

    async fetchRotate(): Promise<void> {
        if (!rotatePromise) {
            rotatePromise = (async () => {
                try {
                    await this._fetch("/auth/token/rotate", {
                        method: "POST",
                        headers: {
                            "X-CSRF-TOKEN": await this.fetchCsrfToken(),
                        },
                        body: JSON.stringify({ fingerprint: getFingerprint() }),
                    });
                } finally {
                    rotatePromise = null;
                }
            })();
        }

        return rotatePromise;
    },

    async fetchRevoke(): Promise<void> {
        try {
            await this._fetch("/auth/token/revoke", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": await this.fetchCsrfToken(),
                },
                body: JSON.stringify({ fingerprint: getFingerprint() }),
            });
        } catch (_) {}
    },
};
