import { ApiErrorPayload, ApiErrorType } from "./errorResponse";

export class ApiClientError extends Error {
    status: number;
    type: ApiErrorType;
    payload?: ApiErrorPayload;

    constructor(
        status: number,
        message: string,
        type?: ApiErrorType,
        payload?: ApiErrorPayload,
    ) {
        super(message);
        this.name = "ApiClientError";
        this.status = status;
        this.type = type || "BadRequestException";
        this.payload = payload;
    }
}
