import { navigate } from "../router";
import { checkAuth, api, updateProcessSettings, checkProcessUpdate, deleteProcess, stopProcess, runProcess, getProcessLogs } from "../api";
import { icon, ArrowLeft, Server, Terminal, Settings, Trash2, RefreshCw, Info, Activity, Square, Play } from "../icons";

type Tab = "console" | "about" | "settings";

interface ProcessDetail {
  id: number;
  name: string;
  phone_number: string;
  auth_type: string;
  client: string;
  status: string;
  verbose: boolean;
  no_skip_old: boolean;
  created_at: string;
}

export async function renderProcessDetailView(params: Record<string, string>) {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    navigate("/login");
    return;
  }

  const app = document.getElementById("app")!;
  app.innerHTML = `<div class="dash-wrapper"><div class="dash-main"><p>Loading…</p></div></div>`;

  let process: ProcessDetail;
  try {
    process = await api.getProcess(params.id);
  } catch (err) {
    app.innerHTML = `<div class="dash-wrapper"><div class="dash-main"><p class="error">${(err as Error).message}</p></div></div>`;
    return;
  }

  let activeTab: Tab = "console";

  function render(consoleLogs: string = "") {
    app.innerHTML = `
    <div class="dash-wrapper">
      <div class="detail-header">
        <button type="button" class="detail-back" id="back-btn">${icon(ArrowLeft, { size: 18 })}</button>
        <div class="detail-title">${icon(Server, { size: 18 })} ${process.name}</div>
        <span class="status-pill ${process.status}">${process.status}</span>
        <div style="margin-left: auto; display: flex; gap: 8px;">
          ${process.status === "running"
        ? `<button type="button" class="outline" id="detail-stop-btn">${icon(Square, { size: 14 })} Stop</button>`
        : `<button type="button" class="outline" id="detail-start-btn">${icon(Play, { size: 14 })} Start</button>`
      }
        </div>
      </div>

      <div class="detail-tabs">
        <button class="detail-tab ${activeTab === "console" ? "active" : ""}" data-tab="console">
          ${icon(Terminal, { size: 15 })} Console
        </button>
        <button class="detail-tab ${activeTab === "about" ? "active" : ""}" data-tab="about">
          ${icon(Info, { size: 15 })} About
        </button>
        <button class="detail-tab ${activeTab === "settings" ? "active" : ""}" data-tab="settings">
          ${icon(Settings, { size: 15 })} Settings
        </button>
      </div>

      <div class="detail-body">
        ${activeTab === "console" ? renderConsoleTab(consoleLogs) : activeTab === "about" ? renderAboutTab(process) : renderSettingsTab(process)}
      </div>
    </div>
  `;

    document.getElementById("back-btn")!.addEventListener("click", () => navigate("/dashboard"));
    document.getElementById("detail-start-btn")?.addEventListener("click", async () => {
      try { await runProcess(String(process.id)); location.reload(); }
      catch (err) { alert((err as Error).message); }
    });
    document.getElementById("detail-stop-btn")?.addEventListener("click", async () => {
      try { await stopProcess(String(process.id)); location.reload(); }
      catch (err) { alert((err as Error).message); }
    });

    document.querySelectorAll(".detail-tab").forEach((btn) => {
      btn.addEventListener("click", async () => {
        activeTab = (btn as HTMLElement).dataset.tab as Tab;
        if (activeTab === "console") {
          const logs = await loadConsoleLogs(process.id);
          render(logs);
        } else {
          render();
        }
      });
    });

    if (activeTab === "settings") {
      wireSettingsTab(process, () => render());
    }
  }

  loadConsoleLogs(process.id).then((logs) => render(logs));

  document.getElementById("detail-start-btn")?.addEventListener("click", async () => {
    try {
      await runProcess(String(process.id));
      location.reload(); // simplest way to refresh full state incl. status pill
    } catch (err) {
      alert((err as Error).message);
    }
  });

  document.getElementById("detail-stop-btn")?.addEventListener("click", async () => {
    try {
      await stopProcess(String(process.id));
      location.reload();
    } catch (err) {
      alert((err as Error).message);
    }
  });

  render();
}

async function loadConsoleLogs(sessionId: number): Promise<string> {
  try {
    const result = await getProcessLogs(String(sessionId));
    return result.logs || "";
  } catch {
    return "";
  }
}

function renderAboutTab(_p: ProcessDetail): string {
  return `
    <div class="about-placeholder">
      <div class="icon-wrap">${icon(Activity, { size: 28 })}</div>
      <h2>Live session stats coming soon</h2>
      <p>Once the process is running, this tab will show real-time details from the session — connection status, message throughput, and more.</p>
    </div>
  `;
}

function renderSettingsTab(p: ProcessDetail): string {
  return `
    <div class="settings-section">
      <div class="settings-group">
        <div class="settings-group-title">Session info</div>
        <div class="info-row">
          <span class="info-row-label">Phone number</span>
          <span class="info-row-value">${p.phone_number}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Client</span>
          <span class="frozen-pill">${p.client}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Auth type</span>
          <span class="frozen-pill">${p.auth_type}</span>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">Behavior</div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Verbose logging</div>
            <div class="settings-row-desc">Include detailed debug output in the console.</div>
          </div>
          <div class="toggle">
            <input type="checkbox" id="verbose-toggle" ${p.verbose ? "checked" : ""} />
            <label for="verbose-toggle"></label>
          </div>
        </div>

        <div class="settings-row">
          <div>
            <div class="settings-row-label">Process offline messages</div>
            <div class="settings-row-desc">Skip messages sent while the process was offline.</div>
          </div>
          <div class="toggle">
            <input type="checkbox" id="skip-old-toggle" ${!p.no_skip_old ? "checked" : ""} />
            <label for="skip-old-toggle"></label>
          </div>
        </div>
      </div>

      <div class="action-row">
        <button type="button" class="outline" id="update-check-btn">${icon(RefreshCw, { size: 14 })} Check for update</button>
      </div>

      <div class="settings-danger">
        <h3>Delete this process</h3>
        <p>This will permanently stop and remove this process. This action cannot be undone.</p>
        <button type="button" class="danger" id="delete-process-btn">${icon(Trash2, { size: 14 })} Delete process</button>
      </div>
    </div>
  `;
}

function wireSettingsTab(process: ProcessDetail, rerender: () => void) {
  document.getElementById("verbose-toggle")?.addEventListener("change", async (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    const toggle = e.target as HTMLInputElement;
    try {
      await updateProcessSettings(String(process.id), { verbose: checked });
      process.verbose = checked;
    } catch (err) {
      toggle.checked = !checked; // revert on failure
      alert((err as Error).message);
    }
  });

  document.getElementById("skip-old-toggle")?.addEventListener("change", async (e) => {
    const toggle = e.target as HTMLInputElement;
    const checked = toggle.checked;
    // UI shows "process offline messages" (checked = process them), backend field is inverted (no_skip_old)
    const noSkipOld = !checked;
    try {
      await updateProcessSettings(String(process.id), { no_skip_old: noSkipOld });
      process.no_skip_old = noSkipOld;
    } catch (err) {
      toggle.checked = !checked; // revert on failure
      alert((err as Error).message);
    }
  });

  document.getElementById("update-check-btn")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Checking…";
    try {
      const result = await checkProcessUpdate(String(process.id));
      alert(result.message);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      btn.disabled = false;
      rerender();
    }
  });

  document.getElementById("delete-process-btn")?.addEventListener("click", async () => {
    if (!confirm(`Delete "${process.name}"? This cannot be undone.`)) return;
    try {
      await deleteProcess(String(process.id));
      navigate("/dashboard");
    } catch (err) {
      alert((err as Error).message);
    }
  });
}

function renderConsoleTab(logs: string): string {
  if (!logs.trim()) {
    return `
      <div class="console-output">
        <span class="console-placeholder">No output yet — start the process to see logs here.</span>
      </div>
    `;
  }
  const escaped = logs
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div class="console-output">${escaped}</div>`;
}