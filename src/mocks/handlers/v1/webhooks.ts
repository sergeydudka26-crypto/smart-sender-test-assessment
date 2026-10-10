import { HttpResponse } from "msw";
import { mockState } from "../../MockState";
import { WebhookList } from "@/src/types";

export const webhooksHandler = async (request: Request) => {

    const url = new URL(request.url);
    const pageParam = parseInt(url.searchParams.get('page') || '1', 10);
    const limitParam = parseInt(url.searchParams.get('limit') || '10', 10);
    const searchParam = (url.searchParams.get('search') || '').trim().toLowerCase();

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? limitParam : 10;

    let filteredWebhooks = mockState.getWebHooks();

    if (searchParam) {
        filteredWebhooks = mockState.getWebHooks().filter(webhook => webhook.name.toLowerCase().includes(searchParam));
    }

    const total = filteredWebhooks.length;
    const lastPage = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filteredWebhooks.slice(start, start + limit);

    const result: WebhookList = {
        data,
        paging: {
            pages: {
                current: page,
                last: lastPage
            },
            results: {
                total,
                limitation: limit
            }
        }
    };

    return HttpResponse.json(result, { status: 200 });
}