import "./style.css";
import { registerRoute, startRouter } from "./router";
import { renderAuthView } from "./views/auth";
import { renderDashboardView } from "./views/dashboard";

registerRoute("/login", renderAuthView);
registerRoute("/dashboard", renderDashboardView);

startRouter();