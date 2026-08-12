import { openModal, closeModal } from "./modal";
import {
  icon, X, Info, Terminal, Code, ShieldCheck, Database, Radio
} from "../icons";

export function openAboutModal() {
  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon(Info, { size: 20 })}
        <div>
          <h2>About Console</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            High-Performance WhatsApp Session Management Console & API Engine
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="about-modal-close-btn">${icon(X, { size: 18 })}</button>
    </div>
    
    <div class="modal-body about-modal-body">
      <!-- Section 1: Engine Overview -->
      <div class="about-card">
        <div class="about-card-title">${icon(Terminal, { size: 16 })} Engine Overview</div>
        <p class="about-card-text">
          <code>wha-console</code> is a web session management system built with Go, Echo, WebAuthn passkeys, and PostgreSQL / Redis backends. It controls and monitors WhatsApp bot process workers operating over Protobuf binary WebSocket streams.
        </p>
        <div class="about-badge-grid">
          <span class="tech-badge">${icon(Code, { size: 12 })} Go 1.22+ & Echo</span>
          <span class="tech-badge">${icon(Radio, { size: 12 })} Binary Protobuf WS</span>
          <span class="tech-badge">${icon(Database, { size: 12 })} PostgreSQL & Redis</span>
          <span class="tech-badge">${icon(ShieldCheck, { size: 12 })} WebAuthn / Passkeys</span>
        </div>
      </div>

      <!-- Section 2: Architecture & Capabilities -->
      <div class="about-card">
        <div class="about-card-title">${icon(ShieldCheck, { size: 16 })} Console Capabilities</div>
        <div class="about-grid-2col">
          <div class="about-subbox">
            <h4>Process Management</h4>
            <ul>
              <li>Process group isolation with Pdeathsig cleanup</li>
              <li>Pairing Code & QR Code auth flows</li>
              <li>Real-time log streaming & clear/export</li>
            </ul>
          </div>
          <div class="about-subbox">
            <h4>Security & Privacy</h4>
            <ul>
              <li>JWT access tokens & HTTP-only refresh cookies</li>
              <li>FIDO2 WebAuthn Passkey integration</li>
              <li>Cookie consent controls & telemetry opting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="about-modal-ok-btn">Got it</button>
    </div>
  `);

  document.getElementById("about-modal-close-btn")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("about-modal-ok-btn")?.addEventListener("click", () => closeModal(overlay));
}
