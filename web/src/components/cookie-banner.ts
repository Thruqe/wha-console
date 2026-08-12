// web/src/components/cookie-banner.ts
import { getConsentPreferences, saveConsentPreferences, trackEvent } from "../telemetry";
import { openModal, closeModal } from "./modal";
import { icon, ShieldCheck, X } from "../icons";
import { showToast } from "./toast";

export function initCookieBanner() {
  const prefs = getConsentPreferences();
  if (prefs.hasChoice) {
    return;
  }

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.id = "cookie-banner-wrap";
  banner.innerHTML = `
    <div class="cookie-banner-content">
      <div class="cookie-banner-icon">${icon(ShieldCheck, { size: 24 })}</div>
      <div class="cookie-banner-text">
        <h4>Cookie & Privacy Preferences</h4>
        <p>
          We use essential cookies to keep your session secure. With your consent, we also collect anonymized telemetry metrics to study and improve process control features.
        </p>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="secondary" id="cookie-customize-btn">Customize</button>
        <button type="button" class="outline" id="cookie-essential-btn">Essential Only</button>
        <button type="button" class="primary" id="cookie-accept-all-btn">Accept All</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById("cookie-accept-all-btn")?.addEventListener("click", async () => {
    await saveConsentPreferences(true, true);
    banner.remove();
    showToast("Preferences saved: Analytics & Telemetry enabled", "success");
    trackEvent("consent_given", "accept_all");
  });

  document.getElementById("cookie-essential-btn")?.addEventListener("click", async () => {
    await saveConsentPreferences(false, false);
    banner.remove();
    showToast("Preferences saved: Essential cookies only", "success");
  });

  document.getElementById("cookie-customize-btn")?.addEventListener("click", () => {
    banner.remove();
    openCookiePreferencesModal();
  });
}

export function openCookiePreferencesModal() {
  const prefs = getConsentPreferences();

  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon(ShieldCheck, { size: 20 })}
        <div>
          <h2>Cookie & Telemetry Settings</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            Control data storage and usage tracking preferences
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="cookie-modal-close">${icon(X, { size: 18 })}</button>
    </div>

    <div class="modal-body">
      <div class="cookie-modal-row">
        <div class="cookie-row-info">
          <div class="cookie-row-title">
            <strong>Essential Cookies</strong>
            <span class="frozen-pill" style="font-size: 11px;">Required</span>
          </div>
          <p class="cookie-row-desc">
            Necessary for site authentication, passkeys, JWT sessions, and security protection. Cannot be turned off.
          </p>
        </div>
        <div class="toggle">
          <input type="checkbox" id="pref-essential" checked disabled />
          <label for="pref-essential"></label>
        </div>
      </div>

      <div class="cookie-modal-row">
        <div class="cookie-row-info">
          <div class="cookie-row-title">
            <strong>Usage Metrics & Telemetry</strong>
          </div>
          <p class="cookie-row-desc">
            Allows us to collect anonymized usage telemetry (page views, process actions) to study feature usage and improve system reliability.
          </p>
        </div>
        <div class="toggle">
          <input type="checkbox" id="pref-analytics" ${prefs.analytics ? "checked" : ""} />
          <label for="pref-analytics"></label>
        </div>
      </div>

      <div class="cookie-modal-row">
        <div class="cookie-row-info">
          <div class="cookie-row-title">
            <strong>Functional Preferences</strong>
          </div>
          <p class="cookie-row-desc">
            Remembers UI preference settings (such as console word-wrap and filter states) across visits.
          </p>
        </div>
        <div class="toggle">
          <input type="checkbox" id="pref-functional" ${prefs.functional ? "checked" : ""} />
          <label for="pref-functional"></label>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="secondary" id="cookie-modal-cancel">Cancel</button>
      <button type="button" class="primary" id="cookie-modal-save">Save Preferences</button>
    </div>
  `);

  document.getElementById("cookie-modal-close")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("cookie-modal-cancel")?.addEventListener("click", () => closeModal(overlay));

  document.getElementById("cookie-modal-save")?.addEventListener("click", async () => {
    const analytics = (document.getElementById("pref-analytics") as HTMLInputElement).checked;
    const functional = (document.getElementById("pref-functional") as HTMLInputElement).checked;

    await saveConsentPreferences(analytics, functional);
    closeModal(overlay);
    showToast("Cookie preferences updated", "success");

    if (analytics) {
      trackEvent("consent_updated", "analytics_enabled");
    }
  });
}
