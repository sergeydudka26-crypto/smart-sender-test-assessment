import { HttpResponse } from "msw";
import { mockState } from "../MockState";
import { errorResponse } from "../errorResponse";

export const authTokenRotate = async (request: Request) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return errorResponse(400, "Malformed JSON payload.");
    }

    const { fingerprint } = body || {};

    if (!mockState.hasSession() || !mockState.isValidFingerprint(fingerprint)) {
        return errorResponse(
            400,
            "Session cannot be rotated. Either not initiated or already revoked.",
        );
    }

    mockState.getSession()?.update();

    return HttpResponse.json({ success: true }, { status: 200 });
};
