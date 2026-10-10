import { HttpResponse } from "msw";
import { mockState, Session } from "../MockState";
import { errorResponse } from "../errorResponse";

type AuthTokenIssueRequest = {
    device_session_token: string;
    fingerprint: string;
};

export const authTokenIssue = async (request: Request) => {
    let body: AuthTokenIssueRequest | null = null;
    try {
        body = await request.json();
    } catch {
        return errorResponse(422, "Malformed JSON payload.");
    }

    const { device_session_token, fingerprint } = body || {};
    const errors: Record<string, string[]> = {};

    if (!fingerprint) {
        errors.fingerprint = ["Fingerprint is required."];
    } else if (!mockState.isValidFingerprint(fingerprint)) {
        errors.fingerprint = ["Invalid or expired fingerprint."];
    }

    if (!device_session_token) {
        errors.device_session_token = ["Device session token is required."];
    } else if (!mockState.hasDeviceSessionToken(device_session_token)) {
        errors.device_session_token = [
            "Invalid or expired device session token.",
        ];
    }

    if (Object.keys(errors).length > 0) {
        return errorResponse(422, "The given data was invalid.", errors);
    }

    mockState.deleteDeviceSessionToken(device_session_token!);
    mockState.setSession(new Session());

    return HttpResponse.json({ success: true }, { status: 200 });
};
