type RouteHandler = (params: Record<string, string>) => void;

const routes: { pattern: string; segments: string[]; handler: RouteHandler }[] = [];

export function registerRoute(pattern: string, handler: RouteHandler) {
    routes.push({ pattern, segments: pattern.split("/").filter(Boolean), handler });
}

export function navigate(path: string) {
    window.location.hash = path;
}

function matchRoute(path: string): { handler: RouteHandler; params: Record<string, string> } | null {
    const pathSegments = path.split("/").filter(Boolean);

    for (const route of routes) {
        if (route.segments.length !== pathSegments.length) continue;

        const params: Record<string, string> = {};
        let matched = true;

        for (let i = 0; i < route.segments.length; i++) {
            const seg = route.segments[i];
            if (seg.startsWith(":")) {
                params[seg.slice(1)] = pathSegments[i]; // Fixed: extract value from actual URL segment
            } else if (seg !== pathSegments[i]) {
                matched = false;
                break;
            }
        }

        if (matched) return { handler: route.handler, params };
    }

    return null;
}

function resolveRoute() {
    let rawHash = window.location.hash.slice(1) || "/login";

    // Handle OAuth callback hash redirect (#oauth_success=true)
    if (rawHash.includes("oauth_success=true")) {
        window.location.hash = "/dashboard";
        return;
    }

    // Strip out query parameters from hash path if present
    const cleanPath = rawHash.split("?")[0] || "/login";
    const match = matchRoute(cleanPath);

    if (match) {
        match.handler(match.params);
    } else {
        const fallback = routes.find((r) => r.pattern === "/404");
        fallback?.handler({});
    }
}

export function startRouter() {
    window.addEventListener("hashchange", resolveRoute);
    resolveRoute();
}