import { getWebhooks } from "../data/data";
import { WebhookEntity } from "../schemas/WebhookSchema";
import { User } from "../types";

type MockStateUser = Pick<
    User,
    "id" | "email" | "first_name" | "last_name" | "name"
>;

export class Session {
    protected expiresAt: number = 0;

    constructor() {
        this.update();
    }

    isExpired(): boolean {
        return this.expiresAt < Date.now();
    }

    update(): void {
        this.expiresAt = Date.now() + 30000;
    }
}

class MockState {
    private session: Session | null = null;
    private deviceSessionTokens = new Set<string>();
    private user: MockStateUser | null = null;
    private webhooks: WebhookEntity[] = [];
    private fingerprint: string | null = null;

    setFingerprint(fingerprint: string): void {
        this.fingerprint = fingerprint;
    }

    getFingerprint(): string | null {
        return this.fingerprint;
    }

    isValidFingerprint(fingerprint?: string): boolean {
        if (!this.fingerprint || !fingerprint) {
            return false;
        }

        return this.fingerprint === fingerprint;
    }

    setSession(session: Session): void {
        this.session = session;
    }

    getSession(): Session | null {
        return this.session;
    }

    hasSession(): boolean {
        return !!this.session;
    }

    addDeviceSessionToken(token: string): void {
        this.deviceSessionTokens.add(token);
    }

    hasDeviceSessionToken(token: string): boolean {
        return this.deviceSessionTokens.has(token);
    }

    deleteDeviceSessionToken(token: string): void {
        this.deviceSessionTokens.delete(token);
    }

    setUser(user: MockStateUser): void {
        this.user = user;
    }

    getUser(): MockStateUser | null {
        return this.user;
    }

    hasUser(): boolean {
        return !!this.user;
    }

    getWebHooks(): WebhookEntity[] {
        return this.webhooks;
    }

    updateWebhook(id: Number, data: WebhookEntity): void {
        this.webhooks = this.webhooks.map((webhook) =>
            webhook.id == id ? data : webhook,
        );
    }

    setWebHooks(webhooks: WebhookEntity[]): void {
        this.webhooks = webhooks;
    }

    reset(): void {
        this.session = null;
        this.deviceSessionTokens.clear();
        this.user = null;
        this.webhooks = getWebhooks();
    }
}

const mockState = new MockState();
mockState.setWebHooks(getWebhooks());

export { mockState };
