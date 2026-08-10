import { openModal, closeModal } from "./modal";
import { icon, X, Smartphone, QrCode, Database } from "../icons";
import { createProcess } from "../api";

export function openProcessConfigModal(onCreated: () => void) {
  const overlay = openModal(`
    <div class="modal-header">
      <h2>Process Configuration</h2>
      <button type="button" class="modal-close" id="modal-close-btn">${icon(X, { size: 18 })}</button>
    </div>
    <form id="process-form">
      <div class="modal-body">
        <div class="field">
          <label for="proc-name">Process Name</label>
          <input type="text" id="proc-name" placeholder="e.g. sales-support" required />
        </div>

        <div class="field">
          <label for="proc-phone">Phone Number</label>
          <input type="tel" id="proc-phone" placeholder="+1 555 123 4567" required />
          <p class="field-hint">Only the last 4 digits are shown on your dashboard.</p>
        </div>

        <div class="field">
          <label>Auth Type</label>
          <div class="radio-group">
            <div class="radio-option">
              <input type="radio" name="auth-type" id="auth-pair" value="pair" checked />
              <label for="auth-pair">${icon(Smartphone, { size: 15 })} Pair Code</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="auth-type" id="auth-qr" value="qr" />
              <label for="auth-qr">${icon(QrCode, { size: 15 })} QR Code</label>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Client</label>
          <div class="radio-group">
            <div class="radio-option">
              <input type="radio" name="client" id="client-chrome" value="chrome" checked />
              <label for="client-chrome">Chrome</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="client" id="client-android" value="android" />
              <label for="client-android">Android</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="client" id="client-ios" value="ios" />
              <label for="client-ios">iOS</label>
            </div>
          </div>
        </div>

        <div class="field">
  <label for="proc-db">Database URL</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${icon(Database, { size: 16 })}</span>
    <input type="text" id="proc-db" class="has-icon" placeholder="postgres://user:pass@host:5432/db" required />
  </div>
  <p class="field-hint">Must be a Postgres connection string.</p>
</div>

        <p id="process-form-error" class="error"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="secondary" id="modal-cancel-btn">Cancel</button>
        <button type="submit" class="primary">Create process</button>
      </div>
    </form>
  `);

  document.getElementById("modal-close-btn")!.addEventListener("click", () => closeModal(overlay));
  document.getElementById("modal-cancel-btn")!.addEventListener("click", () => closeModal(overlay));

  document.getElementById("process-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("process-form-error")!;
    errorEl.textContent = "";

    const name = (document.getElementById("proc-name") as HTMLInputElement).value;
    const phone = (document.getElementById("proc-phone") as HTMLInputElement).value;
    const authType = (document.querySelector('input[name="auth-type"]:checked') as HTMLInputElement).value;
    const client = (document.querySelector('input[name="client"]:checked') as HTMLInputElement).value;
    const databaseUrl = (document.getElementById("proc-db") as HTMLInputElement).value;

    try {
      await createProcess({ name, phone_number: phone, auth_type: authType, client, database_url: databaseUrl });
      closeModal(overlay);
      onCreated();
    } catch (err) {
      errorEl.textContent = (err as Error).message;
    }
  });
}