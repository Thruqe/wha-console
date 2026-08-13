import { navigate } from "../router";
import {
  checkAuth, api, updateProcessSettings, deleteProcess,
  stopProcess, runProcess, clearProcessLogs,
  logoutProcess, cancelWaitlist,
} from "../api";
import {
  icon, ArrowLeft, Server, Terminal, Settings, Trash2, Info,
  Square, Play, Download, ArrowDown, Clock,
  LogOut, WrapText, Layers, Sliders, User, MessageSquare, Send, Users,
  BarChart2, Phone, Copy
} from "../icons";
import { showLoadingOverlay, renderSpinner } from "../components/loading-overlay";
import { showToast } from "../components/toast";
import { showConfirm } from "../components/confirm-modal";
import { openGroupsListModal, openContactsListModal, openCommunitiesListModal } from "../components/item-detail-modals";

type Tab = "console" | "about" | "settings";

interface ProcessDetail {
  id: number;
  name: string;
  phone_number: string;
  auth_type: string;
  client: string;
  status: string;
  desired_status?: string;
  auto_restart?: boolean;
  waitlist_position?: number;
  verbose: boolean;
  no_skip_old: boolean;
  has_run_before: boolean;
  created_at: string;
}

interface ActivityPoint {
  hour: string;
  sent: number;
  recv: number;
}

interface BotStats {
  push_name: string;
  phone_number: string;
  jid: string;
  lid: string;
  profile_photo_url: string;
  messages_sent: number;
  messages_received: number;
  groups_count: number;
  communities_count: number;
  contacts_count: number;
  activity_graph: ActivityPoint[];
}

export async function renderProcessDetailView(params: Record<string, string>) {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    navigate("/login");
    return;
  }

  const app = document.getElementById("app")!;
  app.innerHTML = `<div class="dash-wrapper"><div class="dash-main">${renderSpinner("Loading session details...")}</div></div>`;

  let process: ProcessDetail;
  try {
    process = await api.getProcess(params.id);
  } catch (err) {
    app.innerHTML = `<div class="dash-wrapper"><div class="dash-main"><p class="error">${(err as Error).message}</p></div></div>`;
    return;
  }

  let activeTab: Tab = "console";
  let wordWrap = true;
  let botStats: BotStats | null = null;
  let logAbortController: AbortController | null = null;

  function stopLogStream() {
    if (logAbortController) {
      logAbortController.abort();
      logAbortController = null;
    }
  }

  const handleHashChange = () => {
    stopLogStream();
    window.removeEventListener("hashchange", handleHashChange);
  };
  window.addEventListener("hashchange", handleHashChange);

  function startLogStream() {
    stopLogStream();
    logAbortController = new AbortController();

    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`/api/processes/${process.id}/logs/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: logAbortController.signal,
    }).then(async (res) => {
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() || "";

          for (const block of blocks) {
            if (!block.trim()) continue;
            if (block.includes("event: clear")) {
              const output = document.getElementById("console-output");
              if (output) {
                output.innerHTML = `<span class="console-placeholder">No output yet — start the process to see logs here.</span>`;
              }
              continue;
            }
            for (const line of block.split("\n")) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.text) {
                    appendLogText(data.text);
                  }
                } catch {
                  appendLogText(line.slice(6));
                }
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Log stream error:", err);
        }
      }
    }).catch(() => {});
  }

  async function loadStats() {
    try {
      const res = await fetch(`/api/processes/${process.id}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (res.ok) {
        botStats = await res.json();
      }
    } catch {}
  }

  async function render() {
    app.innerHTML = `
      <div class="dash-wrapper">
        <div class="detail-header">
          <button type="button" class="detail-back" id="back-btn" title="Back to processes">${icon(ArrowLeft, { size: 18 })}</button>
          <div class="detail-title">${icon(Server, { size: 18 })} ${process.name}</div>
          <span class="status-pill ${process.status}">
            ${process.status === "queued" && process.waitlist_position ? `Queued #${process.waitlist_position}` : process.status}
          </span>
          <div style="margin-left: auto; display: flex; gap: 8px;">
            ${process.status === "running"
        ? `<button type="button" class="outline" id="detail-stop-btn">${icon(Square, { size: 14 })} Stop</button>`
        : process.status === "queued"
          ? `<button type="button" class="outline btn-warning" id="detail-cancel-waitlist-btn">${icon(Clock, { size: 14 })} Leave Queue</button>`
          : `<button type="button" class="outline" id="detail-start-btn">${icon(Play, { size: 14 })} Start</button>`
      }
          </div>
        </div>

        <div class="detail-tabs">
          <button class="detail-tab ${activeTab === "console" ? "active" : ""}" data-tab="console">
            ${icon(Terminal, { size: 15 })} Console
          </button>
          <button class="detail-tab ${activeTab === "about" ? "active" : ""}" data-tab="about">
            ${icon(User, { size: 15 })} About Bot
          </button>
          <button class="detail-tab ${activeTab === "settings" ? "active" : ""}" data-tab="settings">
            ${icon(Settings, { size: 15 })} Settings
          </button>
        </div>

        <div class="detail-body">
          ${activeTab === "console"
        ? renderConsoleTab("", wordWrap)
        : activeTab === "about"
          ? renderAboutBotTab(process, botStats)
          : renderSettingsTab(process)
      }
        </div>
      </div>
    `;

    document.getElementById("back-btn")!.addEventListener("click", () => {
      stopLogStream();
      navigate("/dashboard");
    });

    document.getElementById("detail-start-btn")?.addEventListener("click", async () => {
      try {
        await runProcess(String(process.id));
        showToast("Process started", "success");
        location.reload();
      } catch (err) {
        showToast((err as Error).message, "error");
        location.reload();
      }
    });

    document.getElementById("detail-cancel-waitlist-btn")?.addEventListener("click", async () => {
      try {
        await cancelWaitlist(String(process.id));
        showToast("Removed from waitlist", "info");
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
        stopLogStream();
        activeTab = (btn as HTMLElement).dataset.tab as Tab;
        if (activeTab === "console") {
          render();
        } else if (activeTab === "about") {
          if (!botStats) await loadStats();
          render();
        } else {
          render();
        }
      });
    });

    if (activeTab === "console") {
      wireConsoleTab("", process.name, process.id, async () => {
        const output = document.getElementById("console-output");
        if (output) {
          output.innerHTML = `<span class="console-placeholder">No output yet — start the process to see logs here.</span>`;
        }
      });

      document.getElementById("wrap-toggle-btn")?.addEventListener("click", () => {
        wordWrap = !wordWrap;
        render();
      });

      startLogStream();
    } else {
      stopLogStream();
    }

    if (activeTab === "about") {
      wireAboutBotTab(process, botStats?.jid || `${process.phone_number}@s.whatsapp.net`, botStats?.lid || `1${process.phone_number}@lid`);
    }

    if (activeTab === "settings") {
      wireSettingsTab(process, () => render());
    }
  }

  render();
}

function appendLogText(chunk: string) {
  const output = document.getElementById("console-output");
  const jumpBtn = document.getElementById("jump-to-latest");
  const clearBtn = document.getElementById("clear-logs-btn") as HTMLButtonElement | null;
  const saveBtn = document.getElementById("save-logs-btn") as HTMLButtonElement | null;

  if (!output) return;

  const placeholder = output.querySelector(".console-placeholder");
  if (placeholder) {
    output.innerHTML = "";
  }

  const distanceFromBottom = output.scrollHeight - output.scrollTop - output.clientHeight;
  const isNearBottom = distanceFromBottom < 50;

  output.appendChild(document.createTextNode(chunk));

  if (clearBtn) clearBtn.disabled = false;
  if (saveBtn) saveBtn.disabled = false;

  if (isNearBottom) {
    output.scrollTop = output.scrollHeight;
  }

  if (jumpBtn) {
    const newDistanceFromBottom = output.scrollHeight - output.scrollTop - output.clientHeight;
    jumpBtn.classList.toggle("visible", newDistanceFromBottom >= 50);
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
    const contentToSave = output.textContent || rawLogs;
    const blob = new Blob([contentToSave], { type: "text/plain" });
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

function renderAboutBotTab(p: ProcessDetail, stats: BotStats | null): string {
  const pushName = stats?.push_name || p.name;
  const firstLetter = pushName ? pushName.charAt(0).toUpperCase() : "W";
  const photoUrl = stats?.profile_photo_url || "";

  const jid = stats?.jid || `${p.phone_number}@s.whatsapp.net`;
  const lid = stats?.lid || `1${p.phone_number}@lid`;

  const sent = stats?.messages_sent ?? 0;
  const recv = stats?.messages_received ?? 0;
  const groups = stats?.groups_count ?? 0;
  const communities = stats?.communities_count ?? 0;
  const contacts = stats?.contacts_count ?? 0;

  const graph = stats?.activity_graph || [];
  const maxVal = graph.length > 0 ? Math.max(...graph.flatMap(g => [g.sent, g.recv]), 10) : 10;

  return `
    <div class="about-bot-container">
      <!-- Top Card: Profile Avatar & Identity -->
      <div class="bot-profile-card">
        <div class="bot-avatar-wrap">
          ${photoUrl
      ? `<img src="${photoUrl}" alt="${pushName}" class="bot-avatar-img" />`
      : `<div class="bot-avatar-fallback">${firstLetter}</div>`
    }
        </div>
        <div class="bot-profile-info">
          <div class="bot-profile-name-row">
            <h2>${pushName}</h2>
            <span class="status-pill ${p.status}">${p.status}</span>
          </div>
          <div class="bot-identity-pills">
            <span class="id-pill">
              ${icon(Phone, { size: 13 })} ${p.phone_number}
              <button type="button" class="icon-btn-sm" id="copy-pn-btn" title="Copy Phone Number">${icon(Copy, { size: 12 })}</button>
            </span>
            <span class="id-pill">
              <strong>JID:</strong> ${jid}
              <button type="button" class="icon-btn-sm" id="copy-jid-btn" title="Copy JID">${icon(Copy, { size: 12 })}</button>
            </span>
            <span class="id-pill">
              <strong>LID:</strong> ${lid}
              <button type="button" class="icon-btn-sm" id="copy-lid-btn" title="Copy LID">${icon(Copy, { size: 12 })}</button>
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Metric Cards -->
      <div class="bot-stats-grid">
        <div class="stat-card">
          <div class="stat-card-icon" style="background: rgba(22, 163, 74, 0.1); color: #16a34a;">
            ${icon(Send, { size: 18 })}
          </div>
          <div class="stat-card-data">
            <span class="stat-val">${sent.toLocaleString()}</span>
            <span class="stat-lbl">Messages Sent</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
            ${icon(MessageSquare, { size: 18 })}
          </div>
          <div class="stat-card-data">
            <span class="stat-val">${recv.toLocaleString()}</span>
            <span class="stat-lbl">Messages Received</span>
          </div>
        </div>

        <div class="stat-card clickable-stat" id="stat-card-groups" style="cursor: pointer;" title="Click to view joined groups">
          <div class="stat-card-icon" style="background: rgba(168, 85, 247, 0.1); color: #a855f7;">
            ${icon(Users, { size: 18 })}
          </div>
          <div class="stat-card-data" style="flex: 1;">
            <span class="stat-val">${groups.toLocaleString()}</span>
            <span class="stat-lbl">Groups</span>
          </div>
          ${icon(Info, { size: 14, class: "stat-info-icon" })}
        </div>

        <div class="stat-card clickable-stat" id="stat-card-communities" style="cursor: pointer;" title="Click to view communities">
          <div class="stat-card-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
            ${icon(Layers, { size: 18 })}
          </div>
          <div class="stat-card-data" style="flex: 1;">
            <span class="stat-val">${communities.toLocaleString()}</span>
            <span class="stat-lbl">Communities</span>
          </div>
          ${icon(Info, { size: 14, class: "stat-info-icon" })}
        </div>

        <div class="stat-card clickable-stat" id="stat-card-contacts" style="cursor: pointer;" title="Click to view saved contacts">
          <div class="stat-card-icon" style="background: rgba(236, 72, 153, 0.1); color: #ec4899;">
            ${icon(User, { size: 18 })}
          </div>
          <div class="stat-card-data" style="flex: 1;">
            <span class="stat-val">${contacts.toLocaleString()}</span>
            <span class="stat-lbl">Contacts</span>
          </div>
          ${icon(Info, { size: 14, class: "stat-info-icon" })}
        </div>
      </div>

      <!-- Messaging Activity Graph -->
      <div class="bot-graph-card">
        <div class="graph-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${icon(BarChart2, { size: 18 })}
            <h3>Messaging Activity Graph</h3>
          </div>
          <div class="graph-legend">
            <span class="legend-item"><span class="dot sent-dot"></span> Sent</span>
            <span class="legend-item"><span class="dot recv-dot"></span> Received</span>
          </div>
        </div>

        <div class="activity-bar-chart">
          ${graph.length > 0 ? graph.map(pt => {
      const sentH = Math.round((pt.sent / maxVal) * 120);
      const recvH = Math.round((pt.recv / maxVal) * 120);
      return `
              <div class="bar-group">
                <div class="bars-pair">
                  <div class="bar sent-bar" style="height: ${Math.max(sentH, 4)}px;" title="Sent: ${pt.sent}"></div>
                  <div class="bar recv-bar" style="height: ${Math.max(recvH, 4)}px;" title="Received: ${pt.recv}"></div>
                </div>
                <span class="bar-label">${pt.hour}</span>
              </div>
            `;
    }).join("") : `<div class="console-placeholder" style="text-align: center; width: 100%; padding: 30px 0;">No messaging activity recorded yet.</div>`}
        </div>
      </div>
    </div>
  `;
}

function wireAboutBotTab(p: ProcessDetail, jid: string, lid: string) {
  document.getElementById("copy-pn-btn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(p.phone_number).then(() => {
      showToast("Phone number copied to clipboard", "success");
    });
  });

  document.getElementById("copy-jid-btn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(jid).then(() => {
      showToast("JID copied to clipboard", "success");
    });
  });

  document.getElementById("copy-lid-btn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(lid).then(() => {
      showToast("LID copied to clipboard", "success");
    });
  });

  document.getElementById("stat-card-groups")?.addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/processes/${p.id}/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const groups = res.ok ? await res.json() : [];
      openGroupsListModal(groups);
    } catch {
      openGroupsListModal([]);
    }
  });

  document.getElementById("stat-card-communities")?.addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/processes/${p.id}/communities`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const communities = res.ok ? await res.json() : [];
      openCommunitiesListModal(communities);
    } catch {
      openCommunitiesListModal([]);
    }
  });

  document.getElementById("stat-card-contacts")?.addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/processes/${p.id}/contacts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const contacts = res.ok ? await res.json() : [];
      openContactsListModal(contacts);
    } catch {
      openContactsListModal([]);
    }
  });
}

function renderSettingsTab(p: ProcessDetail): string {
  const needsLogout = p.has_run_before && p.status !== "logged_out";
  const canDelete = !needsLogout;

  return `
    <div class="settings-grid-layout">
      <!-- Left Column / Main Panel: Configuration & Behavior -->
      <div class="settings-col">
        <div class="settings-card">
          <div class="settings-card-header">
            ${icon(Sliders, { size: 18 })}
            <div>
              <h3>Process Behavior</h3>
              <p>Configure runtime execution flags and message handling</p>
            </div>
          </div>

          <div class="settings-rows-list">
            <div class="settings-row">
              <div>
                <div class="settings-row-label">Verbose Logging</div>
                <div class="settings-row-desc">Include detailed debug output and packet traces in console logs.</div>
              </div>
              <div class="toggle">
                <input type="checkbox" id="verbose-toggle" ${p.verbose ? "checked" : ""} />
                <label for="verbose-toggle"></label>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Process Offline Messages</div>
                <div class="settings-row-desc">Process messages sent to WhatsApp while this bot process was offline.</div>
              </div>
              <div class="toggle">
                <input type="checkbox" id="skip-old-toggle" ${!p.no_skip_old ? "checked" : ""} />
                <label for="skip-old-toggle"></label>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Auto Restart on Boot</div>
                <div class="settings-row-desc">Automatically restore and restart this process when the server reboots.</div>
              </div>
              <div class="toggle">
                <input type="checkbox" id="auto-restart-toggle" ${p.auto_restart !== false ? "checked" : ""} />
                <label for="auto-restart-toggle"></label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column / Side Panel: Specs & Danger Zone -->
      <div class="settings-col">
        <div class="settings-card">
          <div class="settings-card-header">
            ${icon(Info, { size: 18 })}
            <div>
              <h3>Session Specifications</h3>
              <p>Core session metadata and engine flags</p>
            </div>
          </div>

          <div class="info-rows-list">
            <div class="info-row">
              <span class="info-row-label">Phone Number</span>
              <span class="info-row-value">${p.phone_number}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Client Engine</span>
              <span class="frozen-pill">${p.client}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Auth Method</span>
              <span class="frozen-pill">${p.auth_type}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Current Status</span>
              <span class="status-pill ${p.status}">${p.status}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Created At</span>
              <span class="info-row-value">${new Date(p.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="settings-card danger-card">
          <div class="settings-card-header">
            ${icon(Trash2, { size: 18 })}
            <div>
              <h3 style="color: #e5484d;">Danger Zone</h3>
              <p>High-privilege lifecycle actions</p>
            </div>
          </div>

          ${p.has_run_before
      ? `
            <div class="danger-block">
              <div>
                <strong>Log out WhatsApp Session</strong>
                <p>Stops the process (if running) and revokes WhatsApp session keys using -l flag. Required before deletion.</p>
              </div>
              <button type="button" class="outline" id="logout-session-btn" ${p.status === "logged_out" ? "disabled" : ""}>
                ${icon(LogOut, { size: 14 })} ${p.status === "logged_out" ? "Logged out" : "Log out session"}
              </button>
            </div>`
      : ""
    }

          <div class="danger-block" style="border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px;">
            <div>
              <strong>Delete Process</strong>
              <p>${canDelete ? "Permanently remove this process configuration and logs." : "Log out session before deleting."}</p>
            </div>
            <button type="button" class="danger" id="delete-process-btn" ${canDelete ? "" : "disabled"}>
              ${icon(Trash2, { size: 14 })} Delete process
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function wireSettingsTab(process: ProcessDetail, rerender: () => void) {
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
      } else {
        showToast("Verbose setting updated", "success");
      }
      rerender();
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
      } else {
        showToast("Offline messages setting updated", "success");
      }
      rerender();
    } catch (err) {
      toggle.checked = !checked;
      showToast((err as Error).message, "error");
    }
  });

  document.getElementById("auto-restart-toggle")?.addEventListener("change", async (e) => {
    const toggle = e.target as HTMLInputElement;
    const checked = toggle.checked;
    try {
      await updateProcessSettings(String(process.id), { auto_restart: checked });
      process.auto_restart = checked;
      showToast("Auto-restart setting updated", "success");
      rerender();
    } catch (err) {
      toggle.checked = !checked;
      showToast((err as Error).message, "error");
    }
  });

  document.getElementById("logout-session-btn")?.addEventListener("click", async () => {
    const confirmed = await showConfirm({
      title: "Log out session",
      message: `This will stop "${process.name}" if running, and execute whatsrook -l to log out of WhatsApp. Continue?`,
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
}