import { decodeJwtExpiry } from "./jwt";

const API_BASE = "/api";

let accessToken: string | null = localStorage.getItem("access_token");
let tokenExpiresAt: number | null = accessToken ? decodeJwtExpiry(accessToken) : null;
let lastServerCheck = 0;
const SERVER_CHECK_INTERVAL = 5 * 60 * 1000; // 5 mins


export function setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
        localStorage.setItem("access_token", token);
        tokenExpiresAt = decodeJwtExpiry(token);
    } else {
        tokenExpiresAt = null;
        localStorage.removeItem("access_token");
    }
}

export function getAccessToken() {
    return accessToken;
}

function isTokenFresh(): boolean {
    return !!accessToken && !!tokenExpiresAt && Date.now() < tokenExpiresAt;
}

async function request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: "include",
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(body.error || `Request failed: ${res.status}`);
    }
    return body;
}

async function tryRefresh(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) return false;
        const body = await res.json();
        setAccessToken(body.access_token);
        return true;
    } catch {
        return false;
    }
}


export async function checkAuth(): Promise<boolean> {
    const dueForServerCheck = Date.now() - lastServerCheck > SERVER_CHECK_INTERVAL;

    if (!dueForServerCheck && isTokenFresh()) {
        return true;
    }

    if (accessToken) {
        try {
            await request("/auth/me");
            lastServerCheck = Date.now();
            return true;
        } catch {
            // token invalid, expired, or user no longer exists
        }
    }
    return tryRefresh();
}

export async function logout(): Promise<void> {
    try {
        await request("/auth/logout", { method: "POST" });
    } finally {
        setAccessToken(null);
        lastServerCheck = 0; // force a real check next time, don't trust stale state
    }
}


export const api = {
    signup: (email: string, username: string, password: string) =>
        request("/auth/signup", { method: "POST", body: JSON.stringify({ email, username, password }) }),

    login: (identifier: string, password: string) =>
        request("/auth/login", { method: "POST", body: JSON.stringify({ email: identifier, username: identifier, password }) }),

    listProcesses: () => request("/processes"),

    getProcess: (id: string) => request(`/processes/${id}`),
};

export function createProcess(payload: {
    name: string;
    phone_number: string;
    auth_type: string;
    client: string;
    database_url: string;
}) {
    return request("/processes", { method: "POST", body: JSON.stringify(payload) });
}

export function updateProcessSettings(id: string, payload: { verbose?: boolean; no_skip_old?: boolean; auto_restart?: boolean }) {
    return request(`/processes/${id}/settings`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteProcess(id: string) {
    return request(`/processes/${id}`, { method: "DELETE" });
}

export function checkProcessUpdate(id: string) {
    return request(`/processes/${id}/update`, { method: "POST" });
}
export function runProcess(id: string) {
    return request(`/processes/${id}/run`, { method: "POST" });
}

export function stopProcess(id: string) {
    return request(`/processes/${id}/stop`, { method: "POST" });
}

export function getProcessLogs(id: string) {
    return request(`/processes/${id}/logs`);
}

export function clearProcessLogs(id: string) {
    return request(`/processes/${id}/logs/clear`, { method: "POST" });
}

export function logoutProcess(id: string) {
    return request(`/processes/${id}/logout`, { method: "POST" });
}

export function getLimits() {
    return request("/limits");
}

export function getWaitlist() {
    return request("/processes/waitlist");
}

export function cancelWaitlist(id: string) {
    return request(`/processes/${id}/waitlist`, { method: "DELETE" });
}