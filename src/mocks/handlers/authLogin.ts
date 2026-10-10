import { HttpResponse } from "msw";
import { getUsers } from "../../data/data";
import { mockState } from "../MockState";
import { errorResponse } from "../errorResponse";

type LoginRequest = {
    email: string;
    password: string;
    fingerprint: string;
};

export const authLogin = async (request: Request) => {
    const body = (await request.json()) as LoginRequest;

    const captcha = request.headers.get("X-Captcha-Token");
    if (!captcha || captcha.trim() === "") {
        return errorResponse(422, "The captcha token header is required.");
    }

    const { email, password, fingerprint } = body;

    const errors: Record<string, string[]> = {};

    if (
        !fingerprint ||
        typeof fingerprint !== "string" ||
        fingerprint.length !== 32
    ) {
        errors.fingerprint = [
            "Valid 32-character hex fingerprint is required.",
        ];
    }

    if (!email || typeof email !== "string") {
        errors.email = ["The email field is required."];
    }

    if (!password || typeof password !== "string") {
        errors.password = ["The password field is required."];
    }

    if (Object.keys(errors).length > 0) {
        return errorResponse(422, "Validation failed.", errors);
    }

    const [user] = getUsers().filter(
        (user) => user.email === email && user.password === password,
    );

    if (!user) {
        return errorResponse(401, "Invalid credentials.");
    }

    mockState.setUser({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        name: user.name,
    });

    const token = createDeviceSessionToken();
    mockState.addDeviceSessionToken(token);

    mockState.setFingerprint(fingerprint);

    return HttpResponse.json({ device_session_token: token }, { status: 200 });
};

// On real server it should be a middleware.
export const checkAuth = (): Response | null => {
    const session = mockState.getSession();

    if (!session || session.isExpired()) {
        return errorResponse(401, "Unauthenticated.");
    }

    return null;
};

const createDeviceSessionToken = () => {
    return "device_session_token";
};
