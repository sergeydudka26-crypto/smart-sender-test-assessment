import { ApiErrorPayload, errorResponse } from "../../errorResponse";
import { mockState } from "../../MockState";
import { HttpResponse } from "msw";
import {
    WebhookEntity,
    WebhookUpdateEntity,
    webhookUpdateSchema,
} from "@/src/schemas/WebhookSchema";

export const webhookUpdate = async (request: Request, webhook_id: number) => {
    const webhook = mockState
        .getWebHooks()
        .find((webhook) => webhook.id === webhook_id);

    if (!webhook) {
        return errorResponse(404, `Webhook ${webhook_id} not found.`);
    }

    const body: WebhookUpdateEntity = await request.json();

    const parsedBody = webhookUpdateSchema.safeParse(body);

    if (!parsedBody.success) {
        const errors: ApiErrorPayload = parsedBody.error.issues.reduce(
            (acc, issue) => {
                const fieldName = issue.path[0];
                const message = issue.message;
                return { ...acc, [fieldName]: [message] };
            },
            {} as ApiErrorPayload,
        );
        return errorResponse(422, "The given data was invalid.", errors);
    }

    const newWebhook: WebhookEntity = {
        ...webhook,
        name: body.name || webhook.name,
        url: body.url || webhook.url,
        active: !!(body.active ?? webhook.active),
    };

    mockState.updateWebhook(webhook.id, newWebhook);

    return HttpResponse.json(newWebhook, { status: 201 });
};
