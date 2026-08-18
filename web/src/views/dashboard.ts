import { checkAuth, logout, api, runProcess, stopProcess, deleteProcess, getLimits, cancelWaitlist } from "../api";
import { navigate } from "../router";
import { icon, Terminal, Plus, Play, Square, Trash2, LogOut, Server, Info, ShieldCheck, User, Code, Clock } from "../icons";
import { openProcessConfigModal } from "../components/process-config-modal";
import { openAboutModal } from "../components/about-modal";
import { openCookiePreferencesModal } from "../components/cookie-banner";
import { openUserSettingsModal } from "../components/user-settings-modal";
import { trackEvent } from "../telemetry";
import { showToast } from "../components/toast";
import { showLoadingOverlay, renderSpinner } from "../components/loading-overlay";
import { showConfirm } from "../components/confirm-modal";

interface ProcessItem {
  id: number;
  name: string;
  phone_masked: string;
  auth_type: string;
  client: string;
  status: "running" | "stopped" | "crashed" | "queued";
  waitlist_position?: number;
  created_at: string;
}

interface SystemLimits {
  total_ram_mb: number;
  available_ram_mb: number;
  used_ram_mb: number;
  used_ram_percent: number;
  ram_per_process_mb: number;
  max_ram_percent: number;
  max_allowed_processes: number;
  running_processes: number;
  waitlist_count: number;
  limit_reached: boolean;
  message?: string;
}

export async function renderDashboardView() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    navigate("/login");
    return;
  }

  trackEvent("page_view", "dashboard");

  const app = document.getElementById("app")!;
  app.innerHTML = `<div class="dash-wrapper"><div class="dash-main">${renderSpinner("Loading processes & system metrics...")}</div></div>`;

  let processes: ProcessItem[] = [];
  let limits: SystemLimits | null = null;
  let currentUser: { avatar_url?: string; username?: string } | null = null;

  try {
    const [pRes, lRes, uRes] = await Promise.all([
      api.listProcesses(),
      getLimits().catch(() => null),
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    processes = pRes;
    limits = lRes;
    currentUser = uRes;
  } catch (err) {
    app.innerHTML = `<div class="dash-wrapper"><div class="dash-main"><p class="error">Failed to load dashboard: ${(err as Error).message}</p></div></div>`;
    return;
  }

  const userAvatarHtml = currentUser?.avatar_url
    ? `<img src="${currentUser.avatar_url}" alt="${currentUser.username || 'User'}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;" />`
    : icon(User, { size: 16 });

  app.innerHTML = `
    <div class="dash-wrapper">
      <div class="dash-header">
        <div class="dash-logo">${icon(Terminal, { size: 20 })} wha-console</div>
        <div class="dash-header-actions">
          <button type="button" class="icon-btn" id="api-docs-btn" title="API Keys & Developer Docs">
            ${icon(Code, { size: 16 })}
          </button>
          <button type="button" class="icon-btn" id="user-settings-btn" title="User Account Settings">
            ${userAvatarHtml}
          </button>
          <button type="button" class="icon-btn" id="cookie-pref-btn" title="Cookie & Privacy Settings">
            ${icon(ShieldCheck, { size: 16 })}
          </button>
          <button type="button" class="icon-btn" id="about-btn" title="About Console">
            ${icon(Info, { size: 16 })}
          </button>
          <button type="button" class="icon-btn" id="logout-btn" title="Log out of Console">
            ${icon(LogOut, { size: 16 })}
          </button>
        </div>
      </div>

      <div class="dash-main">
        ${limits ? renderLimitsCard(limits) : ""}

        <div class="dash-title-row">
          <div>
            <h2>Processes</h2>
            <p>Manage running processes across your account</p>
          </div>
          <button type="button" class="primary" id="new-process-btn" style="width: auto; display: flex; align-items: center; gap:8px;">
            ${icon(Plus, { size: 16 })} New process
          </button>
        </div>

        ${processes.length === 0 ? renderEmptyState() : renderProcessGrid(processes)}
      </div>
    </div>
  `;

  document.getElementById("api-docs-btn")!.addEventListener("click", () => {
    navigate("/api-docs");
  });

  document.getElementById("user-settings-btn")!.addEventListener("click", () => {
    openUserSettingsModal();
  });

  document.getElementById("cookie-pref-btn")!.addEventListener("click", () => {
    openCookiePreferencesModal();
  });

  document.getElementById("about-btn")!.addEventListener("click", () => {
    openAboutModal();
  });

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
        showToast("Process started", "success");
        renderDashboardView();
      } catch (err) {
        const errMsg = (err as Error).message;
        showToast(errMsg, "error");
        btn.disabled = false;
        renderDashboardView();
      }
    });

    document.getElementById(`cancel-waitlist-${p.id}`)?.addEventListener("click", async (e) => {
      e.stopPropagation();
      const btn = e.currentTarget as HTMLButtonElement;
      btn.disabled = true;
      try {
        await cancelWaitlist(String(p.id));
        showToast("Removed from waitlist", "info");
        renderDashboardView();
      } catch (err) {
        showToast((err as Error).message, "error");
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
        showToast((err as Error).message, "error");
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

function renderLimitsCard(limits: SystemLimits): string {
  const ramUsedGB = (limits.used_ram_mb / 1024).toFixed(1);
  const ramTotalGB = (limits.total_ram_mb / 1024).toFixed(1);
  const ramAvailMB = limits.available_ram_mb;

  return `
    <div class="limits-card ${limits.limit_reached ? 'limit-active' : ''}">
      <div class="limits-header">
        <div class="limits-title">
          ${icon(Server, { size: 18 })}
          <span>System Memory & Process Limits</span>
          ${limits.limit_reached ? `<span class="limit-badge-alert">Limit Reached</span>` : `<span class="limit-badge-ok">Optimal</span>`}
        </div>
        <div class="limits-meta">
          <span>Allocation: <strong>${limits.ram_per_process_mb} MB</strong> / whatsrook</span>
        </div>
      </div>
      
      <div class="limits-grid">
        <div class="limits-stat-item">
          <span class="stat-label">RAM Usage</span>
          <div class="stat-value-row">
            <strong>${ramUsedGB} GB / ${ramTotalGB} GB</strong>
            <small>(${ramAvailMB} MB Free)</small>
          </div>
          <div class="ram-bar-track">
            <div class="ram-bar-fill" style="width: ${Math.min(100, limits.used_ram_percent)}%;"></div>
          </div>
        </div>

        <div class="limits-stat-item">
          <span class="stat-label">Active Processes</span>
          <div class="stat-value-row">
            <strong>${limits.running_processes} / ${limits.max_allowed_processes}</strong>
            <small>Max Allowed</small>
          </div>
          <div class="ram-bar-track">
            <div class="ram-bar-fill processes-fill" style="width: ${Math.min(100, (limits.running_processes / limits.max_allowed_processes) * 100)}%;"></div>
          </div>
        </div>

        <div class="limits-stat-item">
          <span class="stat-label">Waitlist Queue</span>
          <div class="stat-value-row">
            <strong>${limits.waitlist_count}</strong>
            <small>In Queue</small>
          </div>
        </div>
      </div>

      ${limits.limit_reached ? `
        <div class="limits-notice">
          ${limits.message || "server limit reached, please we aren't able to provide enough services to run your session, we areworking to increase usage limits for everyone"}
        </div>
      ` : ""}
    </div>
  `;
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
  const isQueued = p.status === "queued";
  const posBadge = isQueued && p.waitlist_position ? `Queued #${p.waitlist_position}` : p.status;

  return `
    <div class="process-card ${isQueued ? 'card-queued' : ''}" data-id="${p.id}" style="cursor: pointer;">
      <div class="process-card-header">
        <div class="process-name">${icon(Server, { size: 16 })} ${p.name}</div>
        <span class="status-pill ${p.status}">${posBadge}</span>
      </div>
      <div class="process-meta">${p.phone_masked} · ${p.client}</div>
      <div class="process-actions">
        ${p.status === "running"
      ? `<button id="stop-${p.id}">${icon(Square, { size: 14 })} Stop</button>`
      : isQueued
        ? `<button id="cancel-waitlist-${p.id}" class="btn-warning">${icon(Clock, { size: 14 })} Leave Queue</button>`
        : `<button id="start-${p.id}">${icon(Play, { size: 14 })} Start</button>`
    }
        <button id="delete-${p.id}">${icon(Trash2, { size: 14 })} Delete</button>
      </div>
    </div>
  `;
}