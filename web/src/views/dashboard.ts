import { getAccessToken } from "../api";
import { navigate } from "../router";

export function renderDashboardView() {
    if (!getAccessToken()) {
        navigate("/login");
        return;
    }

    const app = document.getElementById("app")!;
    app.innerHTML = `<h1>Dashboard</h1><p>Logged in. Processes go here.</p>`;
}