import { WebhookEntity } from "../schemas/WebhookSchema";
import { User } from "../types";
import users from "./users.json";
import webhooks from "./webhooks.json";

export const getUsers = (): User[] => {
    return users.users as User[];
};

export const getWebhooks = (): WebhookEntity[] => {
    return webhooks.webhooks as WebhookEntity[];
};
