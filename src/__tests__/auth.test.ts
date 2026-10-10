import { describe, it, expect } from "vitest";
import { ApiClient } from "../utils/apiClient";
import { server } from "../../vitest.setup";
import { http, HttpResponse } from "msw";

describe("Auth Race Condition", () => {
    it("should call rotate only once when two concurrent requests get 401", async () => {
        let rotateCalls = 0;

        server.use(
            http.post("/auth/token/rotate", () => {
                rotateCalls++;
                return new HttpResponse(null, { status: 200 });
            }),
            http.get("/v1/me", () => {
                return new HttpResponse(null, { status: 401 });
            }),
        );

        const results = await Promise.allSettled([
            ApiClient.request("/v1/me"),
            ApiClient.request("/v1/me"),
        ]);

        expect(rotateCalls).toBe(1);

        results.forEach((res) => {
            expect(res.status).toBe("rejected");
        });
    });
});
