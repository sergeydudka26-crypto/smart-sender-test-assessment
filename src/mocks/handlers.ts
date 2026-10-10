import { http, HttpResponse } from "msw";
import { authLogin, checkAuth } from "./handlers/authLogin";
import { checkCSRFToken, csrf } from "./handlers/csrf";
import { authTokenIssue } from "./handlers/authTokenIssue";
import { mockState } from "./MockState";
import { errorResponse } from "./errorResponse";
import { webhooksHandler } from "./handlers/v1/webhooks";
import { webhookUpdate } from "./handlers/v1/webhookUpdate";

export const handlers = [
    http.get("/csrf", async () => {
        return csrf();
    }),

    http.post("/auth/login", async ({ request }) => {
        const csrfErr = checkCSRFToken(request);
        if (csrfErr) return csrfErr;

        return authLogin(request);
    }),

    http.post("/auth/token/issue", async ({ request }) => {
        const csrfErr = checkCSRFToken(request);
        if (csrfErr) return csrfErr;

        return authTokenIssue(request);
    }),

    http.post("/auth/token/rotate", async ({ request }) => {
        const csrfErr = checkCSRFToken(request);
        if (csrfErr) return csrfErr;

        mockState.getSession()?.update();

        return new HttpResponse(null, { status: 204 });
    }),

    http.post("/auth/token/revoke", async ({ request }) => {
        const csrfErr = checkCSRFToken(request);
        if (csrfErr) return csrfErr;

        mockState.reset();

        return new HttpResponse(null, { status: 200 });
    }),

    http.get("/v1/me", async () => {
        const authError = checkAuth();
        if (authError) return authError;

        const user = mockState.getUser();

        return HttpResponse.json(
            {
                id: user?.id,
                email: user?.email,
                first_name: user?.first_name,
                last_name: user?.last_name,
                name: user?.name,
            },
            { status: 200 },
        );
    }),

    http.get("/v1/webhooks", async ({ request }) => {
        const authError = checkAuth();
        if (authError) return authError;

        return webhooksHandler(request);
    }),

    http.get("/v1/webhooks/:webhook_id", async ({ request, params }) => {
        const authError = checkAuth();
        if (authError) return authError;

        const { webhook_id } = await params;

        const webhook = mockState
            .getWebHooks()
            .find((w) => w.id === Number(webhook_id));

        if (!webhook) {
            return errorResponse(404, "Webhook not found.");
        }

        return HttpResponse.json(webhook, { status: 200 });
    }),

    http.put("/v1/webhooks/:webhook_id", async ({ request, params }) => {
        const authError = checkAuth();
        if (authError) return authError;

        const csrfErr = checkCSRFToken(request);
        if (csrfErr) return csrfErr;

        const { webhook_id } = await params;

        return webhookUpdate(request, Number(webhook_id));
    }),
];
