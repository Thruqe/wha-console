const API_BASE = "/api";

let accessToken: string | null = localStorage.getItem("access_token");

export function setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
        localStorage.setItem("access_token", token);
    } else {
        localStorage.removeItem("access_token");
    }
}

export function getAccessToken() {
    return accessToken;
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
        credentials: "include", // send/receive httpOnly refresh cookie
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(body.error || `Request failed: ${res.status}`);
    }
    return body;
}

export const api = {
    signup: (email: string, username: string, password: string) =>
        request("/auth/signup", { method: "POST", body: JSON.stringify({ email, username, password }) }),

    login: (email: string, password: string) =>
        request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    logout: () => request("/auth/logout", { method: "POST" }),

    listProcesses: () => request("/processes"),
};