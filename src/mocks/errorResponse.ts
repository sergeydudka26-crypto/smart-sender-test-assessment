import { HttpResponse } from "msw";

export type ApiErrorType =
    | "BadRequestException"
    | "AuthenticationException"
    | "NotFoundException"
    | "TokenMismatchException"
    | "ValidationException";

export type ApiErrorPayload = {
    [key: string]: string[];
};

export type ApiErrorResponse = {
    error: {
        type: ApiErrorType;
        message: string;
        payload?: ApiErrorPayload;
    };
};

const errorTypeMap = {
    400: "BadRequestException" as ApiErrorType,
    401: "AuthenticationException" as ApiErrorType,
    404: "NotFoundException" as ApiErrorType,
    409: "TokenMismatchException" as ApiErrorType,
    422: "ValidationException" as ApiErrorType,
};

export const errorResponse = (
    status: number,
    message: string,
    payload?: ApiErrorPayload,
) => {
    const body: ApiErrorResponse = {
        error: {
            type:
                errorTypeMap[status as keyof typeof errorTypeMap] ||
                "BadRequestException",
            message,
            ...(payload ? { payload } : {}),
        },
    };

    return HttpResponse.json(body, { status });
};
