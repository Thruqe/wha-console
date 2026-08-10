import "./style.css";
import { registerRoute, startRouter, navigate } from "./router";
import { renderAuthView } from "./views/auth";
import { renderDashboardView } from "./views/dashboard";
import { renderPasskeyPromptView } from "./views/passkey-prompt";
import { renderNotFoundView } from "./views/not-found";
import { checkAuth } from "./api";
import { renderProcessDetailView } from "./views/process-detail";

registerRoute("/login", renderAuthView);
registerRoute("/dashboard", renderDashboardView);
registerRoute("/passkey-prompt", renderPasskeyPromptView);
registerRoute("/processes/:id", renderProcessDetailView);
registerRoute("/404", renderNotFoundView);

async function bootstrap() {
    const isAuthed = await checkAuth();
    const currentHash = window.location.hash.slice(1);

    // If already logged in and sitting on /login (or no hash), send to dashboard
    if (isAuthed && (currentHash === "" || currentHash === "/login")) {
        navigate("/dashboard");
    }
    // If not logged in and trying to hit a protected route, send to login
    if (!isAuthed && currentHash === "/dashboard") {
        navigate("/login");
    }

    startRouter();
}

bootstrap();