import { HttpResponse } from "msw";
import { mockState } from "../MockState";
import { errorResponse } from "../errorResponse";

type AuthTokenRevokeRequest = {
    fingerprint: string;
};

export const authTokenRevoke = async (request: Request) => {
    let body: AuthTokenRevokeRequest | null = null;
    try {
        body = await request.json();
    } catch {
        return errorResponse(400, "Malformed JSON payload.");
    }

    const { fingerprint } = body || {};

    if (!mockState.hasSession() || !mockState.isValidFingerprint(fingerprint)) {
        return errorResponse(
            422,
            "Session cannot be rotated. Either not initiated or already revoked.",
        );
    }

    mockState.reset();

    return new HttpResponse(null, { status: 204 });
};
