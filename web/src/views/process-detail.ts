import { navigate } from "../router";
import {
  checkAuth, api, updateProcessSettings, deleteProcess,
  stopProcess, runProcess, getProcessLogs, clearProcessLogs,
  logoutProcess,
} from "../api";
import {
  icon, ArrowLeft, Server, Terminal, Settings, Trash2, Info,
  Activity, Square, Play, Download, ArrowDown,
  LogOut, WrapText,
} from "../icons";
import { showLoadingOverlay } from "../components/loading-overlay";
import { showToast } from "../components/toast";
import { showConfirm } from "../components/confirm-modal";

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
  has_run_before: boolean;
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
  let wordWrap = true;

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
          ${activeTab === "console" ? renderConsoleTab(consoleLogs, wordWrap) : activeTab === "about" ? renderAboutTab(process) : renderSettingsTab(process)}
        </div>
      </div>
    `;

    document.getElementById("back-btn")!.addEventListener("click", () => navigate("/dashboard"));

    document.getElementById("detail-start-btn")?.addEventListener("click", async () => {
      try {
        await runProcess(String(process.id));
        location.reload();
      } catch (err) {
        showToast((err as Error).message, "error");
      }
    });

    document.getElementById("detail-stop-btn")?.addEventListener("click", async () => {
      try {
        await stopProcess(String(process.id));
        location.reload();
      } catch (err) {
        showToast((err as Error).message, "error");
      }
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

    if (activeTab === "console") {
      wireConsoleTab(consoleLogs, process.name, process.id, async () => {
        const logs = await loadConsoleLogs(process.id);
        render(logs);
      });

      document.getElementById("wrap-toggle-btn")?.addEventListener("click", () => {
        wordWrap = !wordWrap;
        render(consoleLogs);
      });
    }

    if (activeTab === "settings") {
      wireSettingsTab(process, () => render());
    }
  }

  loadConsoleLogs(process.id).then((logs) => render(logs));
}

async function loadConsoleLogs(sessionId: number): Promise<string> {
  try {
    const result = await getProcessLogs(String(sessionId));
    return result.logs || "";
  } catch {
    return "";
  }
}

function renderConsoleTab(logs: string, wordWrap: boolean): string {
  const hasLogs = logs.trim().length > 0;
  return `
    <div class="console-toolbar">
      <button type="button" class="outline toolbar-toggle-btn ${wordWrap ? "active" : ""}" id="wrap-toggle-btn">
        ${icon(WrapText, { size: 14 })} Word wrap
      </button>
      <button type="button" class="outline" id="clear-logs-btn" ${hasLogs ? "" : "disabled"}>
        ${icon(Trash2, { size: 14 })} Clear logs
      </button>
      <button type="button" class="outline" id="save-logs-btn" ${hasLogs ? "" : "disabled"}>
        ${icon(Download, { size: 14 })} Save logs
      </button>
    </div>
    <div class="console-wrapper">
      <div class="console-output ${wordWrap ? "" : "nowrap"}" id="console-output">
        ${hasLogs ? escapeHtml(logs) : `<span class="console-placeholder">No output yet — start the process to see logs here.</span>`}
      </div>
      <button type="button" class="jump-to-latest" id="jump-to-latest">
        ${icon(ArrowDown, { size: 14 })} Jump to latest
      </button>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wireConsoleTab(rawLogs: string, sessionName: string, sessionId: number, onCleared: () => void) {
  const output = document.getElementById("console-output");
  const jumpBtn = document.getElementById("jump-to-latest");
  const saveBtn = document.getElementById("save-logs-btn");

  if (!output || !jumpBtn) return;

  output.scrollTop = output.scrollHeight;

  output.addEventListener("scroll", () => {
    const distanceFromBottom = output.scrollHeight - output.scrollTop - output.clientHeight;
    const isNearBottom = distanceFromBottom < 40;
    jumpBtn.classList.toggle("visible", !isNearBottom);
  });

  jumpBtn.addEventListener("click", () => {
    output.scrollTo({ top: output.scrollHeight, behavior: "smooth" });
  });

  saveBtn?.addEventListener("click", () => {
    const blob = new Blob([rawLogs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sessionName}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("clear-logs-btn")?.addEventListener("click", async () => {
    const confirmed = await showConfirm({
      title: "Clear logs",
      message: "Clear all logs for this process? This cannot be undone.",
      confirmLabel: "Clear",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await clearProcessLogs(String(sessionId));
      onCleared();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  });
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
  const needsLogout = p.has_run_before && p.status !== "logged_out";
  const canDelete = !needsLogout;

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

      ${p.has_run_before
      ? `
      <div class="settings-danger">
        <h3>Log out session</h3>
        <p>Stops the process (if running) and logs the session out of WhatsApp. Required before deleting.</p>
        <button type="button" class="outline" id="logout-session-btn" ${p.status === "logged_out" ? "disabled" : ""}>
          ${icon(LogOut, { size: 14 })} ${p.status === "logged_out" ? "Logged out" : "Log out session"}
        </button>
      </div>`
      : ""
    }

      <div class="settings-danger">
        <h3>Delete this process</h3>
        <p>${canDelete ? "This will permanently remove this process. This action cannot be undone." : "Log out this session before it can be deleted."}</p>
        <button type="button" class="danger" id="delete-process-btn" ${canDelete ? "" : "disabled"}>
          ${icon(Trash2, { size: 14 })} Delete process
        </button>
      </div>
    </div>
  `;
}

function wireSettingsTab(process: ProcessDetail, rerender: () => void) {
  document.getElementById("verbose-toggle")?.addEventListener("change", async (e) => {
    const toggle = e.target as HTMLInputElement;
    const checked = toggle.checked;
    try {
      await updateProcessSettings(String(process.id), { verbose: checked });
      process.verbose = checked;
    } catch (err) {
      toggle.checked = !checked;
      showToast((err as Error).message, "error");
    }
  });

  document.getElementById("skip-old-toggle")?.addEventListener("change", async (e) => {
    const toggle = e.target as HTMLInputElement;
    const checked = toggle.checked;
    const noSkipOld = !checked;
    try {
      await updateProcessSettings(String(process.id), { no_skip_old: noSkipOld });
      process.no_skip_old = noSkipOld;
    } catch (err) {
      toggle.checked = !checked;
      showToast((err as Error).message, "error");
    }
  });

  document.getElementById("logout-session-btn")?.addEventListener("click", async () => {
    const confirmed = await showConfirm({
      title: "Log out session",
      message: `This will stop "${process.name}" if running, and log it out of WhatsApp. Continue?`,
      confirmLabel: "Log out",
      danger: true,
    });
    if (!confirmed) return;

    const hideOverlay = showLoadingOverlay("Logging out session…");
    try {
      await logoutProcess(String(process.id));
      hideOverlay();
      process.status = "logged_out";
      rerender();
    } catch (err) {
      hideOverlay();
      showToast((err as Error).message, "error");
    }
  });

  document.getElementById("delete-process-btn")?.addEventListener("click", async () => {
    const confirmed = await showConfirm({
      title: "Delete process",
      message: `Delete "${process.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    const hideOverlay = showLoadingOverlay("Deleting session…");
    try {
      await deleteProcess(String(process.id));
      hideOverlay();
      navigate("/dashboard");
    } catch (err) {
      hideOverlay();
      showToast((err as Error).message, "error");
    }
  });
  document.getElementById("verbose-toggle")?.addEventListener("change", async (e) => {
    const toggle = e.target as HTMLInputElement;
    const checked = toggle.checked;
    try {
      const result = await updateProcessSettings(String(process.id), { verbose: checked });
      process.verbose = checked;
      if (result.restarted) {
        showToast("Setting saved — process restarted", "success");
      } else if (result.warning) {
        showToast(result.warning, "error");
      }
    } catch (err) {
      toggle.checked = !checked;
      showToast((err as Error).message, "error");
    }
  });

  document.getElementById("skip-old-toggle")?.addEventListener("change", async (e) => {
    const toggle = e.target as HTMLInputElement;
    const checked = toggle.checked;
    const noSkipOld = !checked;
    try {
      const result = await updateProcessSettings(String(process.id), { no_skip_old: noSkipOld });
      process.no_skip_old = noSkipOld;
      if (result.restarted) {
        showToast("Setting saved — process restarted", "success");
      } else if (result.warning) {
        showToast(result.warning, "error");
      }
    } catch (err) {
      toggle.checked = !checked;
      showToast((err as Error).message, "error");
    }
  });
}