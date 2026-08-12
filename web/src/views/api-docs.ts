// web/src/views/api-docs.ts
import { navigate } from "../router";
import { checkAuth } from "../api";
import {
  icon, ArrowLeft, Code, Key, Plus, Copy, Trash2,
  ShieldCheck, BookOpen
} from "../icons";
import { showToast } from "../components/toast";
import { renderSpinner } from "../components/loading-overlay";

interface APIKeyItem {
  id: number;
  name: string;
  key: string;
  last_used_at?: string;
  created_at: string;
}

export async function renderApiDocsView() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    navigate("/login");
    return;
  }

  const app = document.getElementById("app")!;
  app.innerHTML = `<div class="dash-wrapper"><div class="dash-main">${renderSpinner("Loading API key manager...")}</div></div>`;

  let apiKeys: APIKeyItem[] = [];
  try {
    const res = await fetch("/api/keys", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });
    if (res.ok) {
      apiKeys = await res.json();
    }
  } catch {}

  app.innerHTML = `
    <div class="dash-wrapper">
      <div class="dash-header">
        <button type="button" class="detail-back" id="api-back-btn" title="Back to Dashboard">
          ${icon(ArrowLeft, { size: 18 })}
        </button>
        <div class="dash-logo">${icon(Code, { size: 20 })} API Keys & Integration Docs</div>
      </div>

      <div class="dash-main" style="max-width: 1100px; margin: 0 auto;">
        <!-- Header Banner -->
        <div class="about-hero-card" style="margin-bottom: 24px;">
          <div class="about-hero-header">
            <div class="about-hero-icon">${icon(Key, { size: 24 })}</div>
            <div>
              <h3>API Authentication & Keys</h3>
              <p>Generate API keys for external scripts, CLI automation, and backend integrations. API key routes are uninhibited (not rate-limited).</p>
            </div>
          </div>
        </div>

        <div class="settings-grid-layout">
          <!-- Left Column: API Key Generator & List -->
          <div class="settings-col">
            <div class="settings-card">
              <div class="settings-card-header">
                ${icon(Key, { size: 18 })}
                <div>
                  <h3>Create New API Key</h3>
                  <p>Issue an uninhibited API key for automation</p>
                </div>
              </div>

              <form id="create-key-form" style="display: flex; gap: 10px; align-items: flex-end;">
                <div class="field" style="flex: 1;">
                  <label for="key-name">Key Identifier / Name</label>
                  <input type="text" id="key-name" placeholder="e.g. CLI Bot Worker" required />
                </div>
                <button type="submit" class="primary" style="margin-top: 0; width: auto; display: flex; align-items: center; gap: 6px;">
                  ${icon(Plus, { size: 16 })} Generate Key
                </button>
              </form>
            </div>

            <div class="settings-card">
              <div class="settings-card-header">
                ${icon(ShieldCheck, { size: 18 })}
                <div>
                  <h3>Your Active API Keys</h3>
                  <p>Manage existing keys and credentials</p>
                </div>
              </div>

              <div id="api-keys-list">
                ${apiKeys.length === 0
      ? `<p style="color: var(--text); font-size: 14px; font-style: italic;">No API keys generated yet. Create one above to begin.</p>`
      : apiKeys.map(renderKeyRow).join("")
    }
              </div>
            </div>
          </div>

          <!-- Right Column: API Code Use Cases -->
          <div class="settings-col">
            <div class="settings-card">
              <div class="settings-card-header">
                ${icon(BookOpen, { size: 18 })}
                <div>
                  <h3>Integration Use Cases</h3>
                  <p>Authentication header & code examples</p>
                </div>
              </div>

              <div style="font-size: 13px; color: var(--text); line-height: 150%;">
                <p style="margin-bottom: 12px;">Pass your API Key in requests via header:</p>
                <div class="cli-cmd-box" style="margin-bottom: 16px;">
                  <code>X-API-Key: wha_live_...</code>
                </div>

                <h4 style="color: var(--text-h); font-size: 14px; margin: 16px 0 6px;">1. List Processes (cURL)</h4>
                <div class="cli-cmd-box">
                  <code>curl -H "X-API-Key: YOUR_API_KEY" http://localhost:8080/api/processes</code>
                </div>

                <h4 style="color: var(--text-h); font-size: 14px; margin: 16px 0 6px;">2. Start Process (Python)</h4>
                <div class="cli-cmd-box" style="white-space: pre-wrap;">
                  <code>import requests
requests.post('http://localhost:8080/api/processes/1/run',
              headers={'X-API-Key': 'YOUR_API_KEY'})</code>
                </div>

                <h4 style="color: var(--text-h); font-size: 14px; margin: 16px 0 6px;">3. Read Live Logs (Node.js / Bun)</h4>
                <div class="cli-cmd-box" style="white-space: pre-wrap;">
                  <code>const res = await fetch('http://localhost:8080/api/processes/1/logs', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
const { logs } = await res.json();</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("api-back-btn")!.addEventListener("click", () => navigate("/dashboard"));

  document.getElementById("create-key-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("key-name") as HTMLInputElement;
    const name = nameInput.value;

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to generate API key");

      const created = await res.json();
      showToast(`API Key "${created.name}" generated!`, "success");
      renderApiDocsView();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  });

  apiKeys.forEach((k) => {
    document.getElementById(`copy-key-${k.id}`)?.addEventListener("click", () => {
      navigator.clipboard.writeText(k.key).then(() => {
        showToast("API Key copied to clipboard", "success");
      });
    });

    document.getElementById(`revoke-key-${k.id}`)?.addEventListener("click", async () => {
      if (!confirm(`Revoke API key "${k.name}"?`)) return;

      try {
        const res = await fetch(`/api/keys/${k.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        if (!res.ok) throw new Error("Failed to revoke key");

        showToast("API key revoked", "success");
        renderApiDocsView();
      } catch (err) {
        showToast((err as Error).message, "error");
      }
    });
  });
}

function renderKeyRow(k: APIKeyItem): string {
  const maskedKey = k.key.substring(0, 12) + "..." + k.key.substring(k.key.length - 4);
  const lastUsed = k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never";

  return `
    <div style="border-bottom: 1px solid var(--border); padding: 14px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <strong style="color: var(--text-h); font-size: 14px;">${k.name}</strong>
        <span style="font-size: 12px; color: var(--text);">Used: ${lastUsed}</span>
      </div>
      <div class="cli-cmd-box" style="margin-bottom: 8px;">
        <code>${maskedKey}</code>
        <button type="button" class="icon-btn-sm" id="copy-key-${k.id}" title="Copy API Key">
          ${icon(Copy, { size: 14 })}
        </button>
      </div>
      <button type="button" class="danger" id="revoke-key-${k.id}" style="padding: 5px 10px; font-size: 12px;">
        ${icon(Trash2, { size: 12 })} Revoke Key
      </button>
    </div>
  `;
}
