"use client";

import { ApiClientError } from "@/src/mocks/ApiClientError";
import { WebhookList } from "@/src/types";
import { ApiClient } from "@/src/utils/apiClient";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function WebhooksPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const urlPage = parseInt(searchParams.get("page") || "1");
    const urlSearch = searchParams.get("search") || "";
    const currentPage = urlPage < 1 ? 1 : urlPage;

    const [page, setPage] = useState<number>(currentPage);
    const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
    const [searchString, setSearchString] = useState<string>(urlSearch);

    const { data, isLoading, error } = useQuery<WebhookList, ApiClientError>({
        queryKey: ["webhooks", page, searchString],
        queryFn: () => {
            const params = new URLSearchParams();
            if (page > 1) params.set("page", page.toString());
            if (searchString) params.set("search", searchString);

            router.push(`/webhooks?${params.toString()}`);
            return ApiClient.request<WebhookList>(
                `/v1/webhooks?${params.toString()}`,
            );
        },
    });

    const webhooks = data?.data || [];
    const pages = data?.paging.pages.last || 1;
    const total = data?.paging.results.total || 0;

    const submitSearchHandler = (
        e:
            | React.MouseEvent<HTMLButtonElement>
            | React.KeyboardEvent<HTMLInputElement>,
    ) => {
        e.preventDefault();
        setPage(1);
        setSearchString(searchQuery);
    };

    return (
        <div>
            <h1>Webhooks</h1>
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">
                    Failed to load webhooks: {error.message}
                </p>
            ) : (
                <>
                    <div className="mb-4 flex items-end gap-4">
                        <input
                            type="text"
                            placeholder="Search webhooks"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyUp={(
                                e: React.KeyboardEvent<HTMLInputElement>,
                            ) => {
                                if (e.key === "Enter") submitSearchHandler(e);
                            }}
                            className="border-2 px-2 py-1"
                        />
                        <button
                            type="submit"
                            onClick={submitSearchHandler}
                            className="border-2 px-2 py-1"
                        >
                            Submit
                        </button>
                    </div>

                    {!!webhooks.length ? (
                        <table className="border-2">
                            <thead>
                                <tr>
                                    <th className="border-2 p-2">Name</th>
                                    <th className="border-2 p-2">URL</th>
                                    <th className="border-2 p-2">Active</th>
                                    <th className="border-2 p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {webhooks.map((webhook) => (
                                    <tr key={webhook.id}>
                                        <td className="border-2 p-2">
                                            {webhook.name}
                                        </td>
                                        <td className="border-2 p-2">
                                            {webhook.url}
                                        </td>
                                        <td className="border-2 p-2">
                                            {webhook.active
                                                ? "Active"
                                                : "Inactive"}
                                        </td>
                                        <td className="border-2 p-2">
                                            <Link
                                                href={`/webhooks/${webhook.id}`}
                                                className="border-2 px-2 py-1"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No webhooks found</p>
                    )}

                    <div className="mt-4 flex items-center gap-2 justify-between">
                        <div>Total: {total}</div>
                        <div className="flex gap-2">
                            {Array.from({ length: pages }, (_, i) => i + 1).map(
                                (p) =>
                                    page == p ? (
                                        <span key={p} className="border-2 p-2">
                                            {p}
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            className="border-2 p-2"
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ),
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
