"use client";

import {
    WebhookEntity,
    WebhookUpdateEntity,
    webhookUpdateSchema,
} from "@/src/schemas/WebhookSchema";
import { ApiClient } from "@/src/utils/apiClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiClientError } from "@/src/mocks/ApiClientError";
import { useQuery } from "@tanstack/react-query";

export default function WebhookPage() {
    const [emptyData, setEmptyData] = useState<boolean>(false);
    const [requestIsPending, setRequestIsPending] = useState<boolean>(false);
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const { data, isLoading, error } = useQuery<WebhookEntity, ApiClientError>({
        queryKey: [params.id],
        queryFn: () => {
            return ApiClient.request<WebhookEntity>(
                `/v1/webhooks/${params.id}`,
            );
        },
    });

    useEffect(() => {
        if (error) {
            setEmptyData(true);
        }
    }, [error]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<WebhookUpdateEntity>({
        resolver: zodResolver(webhookUpdateSchema),
        mode: "onSubmit",
        values: data,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (emptyData) {
        return <div>Webhook not found</div>;
    }

    const updateWebhook = async (data: WebhookUpdateEntity) => {
        setRequestIsPending(true);
        ApiClient.request<WebhookEntity>(`/v1/webhooks/${params.id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
            .then(() => {
                router.back();
            })
            .catch((error) => {
                if (error instanceof ApiClientError) {
                    const errs = error.payload as Record<string, string[]>;

                    Object.keys(errs).forEach((key) => {
                        setError(key as keyof WebhookUpdateEntity, {
                            message: errs[key][0],
                        });
                    });
                }
            })
            .finally(() => {
                setRequestIsPending(false);
            });
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit(updateWebhook)}
                className="flex flex-col gap-4"
            >
                <div>
                    <label htmlFor="id">ID</label>
                    <input
                        type="number"
                        id="id"
                        value={data?.id}
                        disabled
                        className="p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className="p-2 border border-gray-300 rounded"
                    />
                    {errors.name && (
                        <p className="text-red-500">{errors.name.message}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="url">URL</label>
                    <input
                        type="text"
                        id="url"
                        {...register("url")}
                        className="p-2 border border-gray-300 rounded"
                    />
                    {errors.url && (
                        <p className="text-red-500">{errors.url.message}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="active">Active</label>
                    <input
                        type="checkbox"
                        id="active"
                        {...register("active")}
                        className="p-2 border border-gray-300 rounded"
                    />
                    {errors.active && (
                        <p className="text-red-500">{errors.active.message}</p>
                    )}
                </div>

                <div className="flex justify-between">
                    <input
                        type="submit"
                        disabled={requestIsPending}
                        value="Update"
                        className="px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
                    />

                    <button
                        type="button"
                        onClick={() => {
                            router.back();
                        }}
                        className="px-3 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
