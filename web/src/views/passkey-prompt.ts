import { registerPasskey } from "../webauthn";
import { navigate } from "../router";
import { icon, Fingerprint } from "../icons";

export function renderPasskeyPromptView() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-content">
        <div class="auth-logo">${icon(Fingerprint, { size: 22 })} wha-console</div>
        <h1>Add a <span class="gradient">passkey</span></h1>
        <p class="auth-subtitle">Sign in faster next time, no password needed.</p>
        <button type="button" class="primary" id="add-passkey">Add passkey</button>
        <button type="button" class="secondary" id="skip-passkey" style="margin-top: 12px;">Skip for now</button>
        <p id="passkey-error" class="error"></p>
      </div>
    </div>
  `;

    document.getElementById("add-passkey")!.addEventListener("click", async () => {
        const errorEl = document.getElementById("passkey-error")!;
        errorEl.textContent = "";
        try {
            await registerPasskey();
            navigate("/dashboard");
        } catch (err) {
            errorEl.textContent = (err as Error).message;
        }
    });

    document.getElementById("skip-passkey")!.addEventListener("click", () => {
        navigate("/dashboard");
    });
}