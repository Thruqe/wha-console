import { checkAuth, logout, api, runProcess, stopProcess, deleteProcess } from "../api";
import { navigate } from "../router";
import { icon, Terminal, Plus, Play, Square, Trash2, LogOut, Server } from "../icons";
import { openProcessConfigModal } from "../components/process-config-modal";
import { showToast } from "../components/toast";
import { showLoadingOverlay } from "../components/loading-overlay";
import { showConfirm } from "../components/confirm-modal";

interface ProcessItem {
  id: number;
  name: string;
  phone_masked: string;
  auth_type: string;
  client: string;
  status: "running" | "stopped" | "crashed";
  created_at: string;
}

export async function renderDashboardView() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    navigate("/login");
    return;
  }

  const app = document.getElementById("app")!;
  app.innerHTML = `<div class="dash-wrapper"><div class="dash-main"><p>Loading…</p></div></div>`;

  let processes: ProcessItem[] = [];
  try {
    processes = await api.listProcesses();
  } catch (err) {
    app.innerHTML = `<div class="dash-wrapper"><div class="dash-main"><p class="error">Failed to load processes: ${(err as Error).message}</p></div></div>`;
    return;
  }

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
  });

  document.getElementById("new-process-btn")!.addEventListener("click", () => {
    openProcessConfigModal(() => renderDashboardView());
  });

  document.getElementById("empty-new-process-btn")?.addEventListener("click", () => {
    openProcessConfigModal(() => renderDashboardView());
  });

  processes.forEach((p) => {
    const card = document.querySelector(`.process-card[data-id="${p.id}"]`);
    card?.addEventListener("click", () => navigate(`/processes/${p.id}`));

    document.getElementById(`start-${p.id}`)?.addEventListener("click", async (e) => {
      e.stopPropagation();
      const btn = e.currentTarget as HTMLButtonElement;
      btn.disabled = true;
      try {
        await runProcess(String(p.id));
        renderDashboardView();
      } catch (err) {
        alert((err as Error).message);
        btn.disabled = false;
      }
    });

    document.getElementById(`stop-${p.id}`)?.addEventListener("click", async (e) => {
      e.stopPropagation();
      const btn = e.currentTarget as HTMLButtonElement;
      btn.disabled = true;
      try {
        await stopProcess(String(p.id));
        renderDashboardView();
      } catch (err) {
        alert((err as Error).message);
        btn.disabled = false;
      }
    });
    document.getElementById(`delete-${p.id}`)?.addEventListener("click", async (e) => {
      e.stopPropagation();

      try {
        const confirmed = await showConfirm({
          title: "Delete process",
          message: `Delete "${p.name}"? This cannot be undone.`,
          confirmLabel: "Delete",
          danger: true,
        });
        if (!confirmed) return;

        const hideOverlay = showLoadingOverlay("Deleting session…");
        try {
          await deleteProcess(String(p.id));
          hideOverlay();
          renderDashboardView();
        } catch (err) {
          hideOverlay();
          showToast((err as Error).message, "error");
        }
      } catch (err) {
        console.error("delete flow crashed:", err);
      }
    });
  });
}

function renderEmptyState(): string {
  return `
    <div class="empty-state">
      <div class="icon-wrap">${icon(Server, { size: 28 })}</div>
      <h2>No processes yet</h2>
      <p>Start your first process to see it here.</p>
      <button type="button" class="primary" id="empty-new-process-btn" style="width: auto; margin-top: 16px; display: inline-flex; align-items: center; gap: 8px;">
        ${icon(Plus, { size: 16 })} New process
      </button>
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
    <div class="process-card" data-id="${p.id}" style="cursor: pointer;">
      <div class="process-card-header">
        <div class="process-name">${icon(Server, { size: 16 })} ${p.name}</div>
        <span class="status-pill ${p.status}">${p.status}</span>
      </div>
      <div class="process-meta">${p.phone_masked} · ${p.client}</div>
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