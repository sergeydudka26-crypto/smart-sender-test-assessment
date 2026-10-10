import { HttpResponse } from "msw";

export const FIXED_CSRF_TOKEN = "smart-sender-csrf-secret-token-xyz";

export const csrf = () => {
    return new HttpResponse(null, {
        status: 204,
        headers: {
            "X-CSRF-TOKEN": FIXED_CSRF_TOKEN,
        },
    });
};

// It should be also a middleware on real server.
export const checkCSRFToken = (request: Request) => {
    const token = request.headers.get("X-CSRF-TOKEN");

    if (!token || token !== FIXED_CSRF_TOKEN) {
        return new HttpResponse(
            JSON.stringify({
                error: {
                    type: "TokenMismatchException",
                    message: "CSRF token mismatch or missing.",
                },
            }),
            {
                status: 422,
            },
        );
    }
    return null;
};
