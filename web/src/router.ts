import { renderPasskeyPromptView } from "./views/passkey-prompt";

type RouteHandler = () => void;

const routes: Record<string, RouteHandler> = {};

export function registerRoute(path: string, handler: RouteHandler) {
    routes[path] = handler;
}


registerRoute("/passkey-prompt", renderPasskeyPromptView);

export function navigate(path: string) {
    window.location.hash = path;
}

function resolveRoute() {
    const path = window.location.hash.slice(1) || "/login";
    const handler = routes[path] || routes["/login"];
    if (!handler) {
        throw new Error(`No route handler found for path: ${path} and fallback '/login' is unregistered.`);
    }
    handler();
}

export function startRouter() {
    window.addEventListener("hashchange", resolveRoute);
    resolveRoute();
}