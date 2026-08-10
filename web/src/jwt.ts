export function decodeJwtExpiry(token: string): number | null {
    try {
        const payload = token.split(".")[1];
        const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(
            payload.length + ((4 - (payload.length % 4)) % 4),
            "="
        );
        const json = JSON.parse(atob(padded));
        // exp is in seconds since epoch (standard JWT claim); convert to ms
        return typeof json.exp === "number" ? json.exp * 1000 : null;
    } catch {
        return null;
    }
}