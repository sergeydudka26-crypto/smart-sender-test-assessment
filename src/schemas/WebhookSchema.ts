import { z } from "zod";

export const webhookSchema = z.object({
    id: z.number(),
    name: z.string().min(3).max(100),
    url: z.url(),
    active: z.boolean(),
    created_at: z.string(),
});

export type WebhookEntity = z.infer<typeof webhookSchema>;

export const webhookCreateSchema = webhookSchema.omit({
    id: true,
    created_at: true,
});

export type WebhookCreateEntity = z.infer<typeof webhookCreateSchema>;

export const webhookUpdateSchema = webhookSchema
    .omit({
        id: true,
        created_at: true,
    })
    .partial();

export type WebhookUpdateEntity = z.infer<typeof webhookUpdateSchema>;
