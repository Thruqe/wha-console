import { checkAuth } from "../api";
import { navigate } from "../router";

export async function renderDashboardView() {
    const isAuthed = await checkAuth();
    if (!isAuthed) {
        navigate("/login");
        return;
    }

    const app = document.getElementById("app")!;
    app.innerHTML = `<h1>Dashboard</h1><p>Logged in. Processes go here.</p>`;
}