import { checkAuth, logout } from "../api";
import { navigate } from "../router";
import { icon, Terminal, Plus, Play, Square, Trash2, LogOut, Server } from "../icons";

type ProcessStatus = "running" | "stopped" | "crashed";

interface ProcessItem {
    id: string;
    name: string;
    status: ProcessStatus;
    uptime: string;
}

// Stub data — will be replaced by api.listProcesses() once the backend is real.
const STUB_PROCESSES: ProcessItem[] = [
    { id: "1", name: "worker-main", status: "running", uptime: "2h 14m" },
    { id: "2", name: "cron-sync", status: "stopped", uptime: "—" },
    { id: "3", name: "api-gateway", status: "crashed", uptime: "—" },
];

export async function renderDashboardView() {
    const isAuthed = await checkAuth();
    if (!isAuthed) {
        navigate("/login");
        return;
    }

    const app = document.getElementById("app")!;
    const processes = STUB_PROCESSES; // swap for: await api.listProcesses()

    app.innerHTML = `
    <div class="dash-wrapper">
      <div class="dash-header">
        <div class="dash-logo">${icon(Terminal, { size: 20 })} wha-console</div>
        <div class="dash-header-actions">
          <button type="button" class="icon-btn" id="logout-btn" title="Log out">
            ${icon(LogOut, { size: 16 })}
          </button>
        </div>
      </div>

      <div class="dash-main">
        <div class="dash-title-row">
          <div>
            <h2>Processes</h2>
            <p>Manage running processes across your account</p>
          </div>
          <button type="button" class="primary" id="new-process-btn" style="width: auto; display: flex; align-items: center; gap: 8px;">
            ${icon(Plus, { size: 16 })} New process
          </button>
        </div>

        ${processes.length === 0 ? renderEmptyState() : renderProcessGrid(processes)}
      </div>
    </div>
  `;

    document.getElementById("logout-btn")!.addEventListener("click", async () => {
        await logout();
        navigate("/login");
    })

    document.getElementById("new-process-btn")!.addEventListener("click", () => {
        alert("Process creation coming soon");
    });

    processes.forEach((p) => {
        document.getElementById(`start-${p.id}`)?.addEventListener("click", () => {
            console.log("start", p.id);
        });
        document.getElementById(`stop-${p.id}`)?.addEventListener("click", () => {
            console.log("stop", p.id);
        });
        document.getElementById(`delete-${p.id}`)?.addEventListener("click", () => {
            console.log("delete", p.id);
        });
    });
}

function renderEmptyState(): string {
    return `
    <div class="empty-state">
      <div class="icon-wrap">${icon(Server, { size: 28 })}</div>
      <h2>No processes yet</h2>
      <p>Start your first process to see it here.</p>
    </div>
  `;
}

function renderProcessGrid(processes: ProcessItem[]): string {
    return `
    <div class="process-grid">
      ${processes.map(renderProcessCard).join("")}
    </div>
  `;
}

function renderProcessCard(p: ProcessItem): string {
    return `
    <div class="process-card">
      <div class="process-card-header">
        <div class="process-name">${icon(Server, { size: 16 })} ${p.name}</div>
        <span class="status-pill ${p.status}">${p.status}</span>
      </div>
      <div class="process-meta">Uptime: ${p.uptime}</div>
      <div class="process-actions">
        ${p.status === "running"
            ? `<button id="stop-${p.id}">${icon(Square, { size: 14 })} Stop</button>`
            : `<button id="start-${p.id}">${icon(Play, { size: 14 })} Start</button>`
        }
        <button id="delete-${p.id}">${icon(Trash2, { size: 14 })} Delete</button>
      </div>
    </div>
  `;
}