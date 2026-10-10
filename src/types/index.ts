import { WebhookEntity } from "../schemas/WebhookSchema";

export type User = {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    name: string;
};

export interface Paging {
    pages: {
        current: number;
        last: number;
    };
    results: {
        total: number;
        limitation: number;
    };
}

export interface WebhookList {
    data: WebhookEntity[];
    paging: Paging;
}
