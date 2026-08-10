import { api, setAccessToken } from "../api";
import { navigate } from "../router";
import { icon, Terminal, Mail, Lock, Eye, EyeOff, Fingerprint } from "../icons";

export function renderAuthView() {
    const app = document.getElementById("app")!;
    let mode: "login" | "signup" = "login";
    let showPassword = false;

    function render() {
        app.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-content">
          <div class="auth-logo">${icon(Terminal, { size: 22 })} wha-console</div>
          <h1>${mode === "login"
                ? `Welcome <span class="gradient">back</span>`
                : `Manage your <span class="gradient">processes</span>`
            }</h1>
          <p class="auth-subtitle">
            ${mode === "login" ? "Sign in to your console" : "Create an account to get started"}
          </p>

          <button type="button" id="passkey-btn" class="secondary">
            ${icon(Fingerprint, { size: 18 })} Sign in with a passkey
          </button>

          <div class="divider">or</div>

          <form id="auth-form">
            ${mode === "signup"
                ? `<div class="field">
                     <label for="username">Username</label>
                     <input type="text" id="username" placeholder="yourname" required />
                   </div>`
                : ""
            }
           <div class="field">
  <label for="email">Email</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${icon(Mail, { size: 16 })}</span>
    <input type="email" id="email" class="has-icon" placeholder="your@email.com" required />
  </div>
</div>
<div class="field">
  <label for="password">Password</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${icon(Lock, { size: 16 })}</span>
    <input type="${showPassword ? "text" : "password"}" id="password" class="has-icon" placeholder="••••••••" required />
    <button type="button" class="icon-toggle" id="toggle-password">
      ${icon(showPassword ? EyeOff : Eye, { size: 16 })}
    </button>
  </div>
</div>
            <button type="submit" class="primary">${mode === "login" ? "Sign in" : "Sign up"}</button>
            <p id="auth-error" class="error"></p>
          </form>
          <p class="auth-footer">
            ${mode === "login" ? "Need an account?" : "Already have an account?"}
            <a href="#" id="toggle-mode" class="link">${mode === "login" ? "Sign up" : "Sign in"}</a>
          </p>
        </div>
      </div>
    `;

        document.getElementById("toggle-mode")!.addEventListener("click", (e) => {
            e.preventDefault();
            mode = mode === "login" ? "signup" : "login";
            showPassword = false;
            render();
        });

        document.getElementById("toggle-password")!.addEventListener("click", () => {
            const passwordInput = document.getElementById("password") as HTMLInputElement;
            const toggleBtn = document.getElementById("toggle-password")!;
            showPassword = !showPassword;

            passwordInput.type = showPassword ? "text" : "password";
            toggleBtn.innerHTML = icon(showPassword ? EyeOff : Eye, { size: 16 });
        });

        document.getElementById("passkey-btn")!.addEventListener("click", async () => {
            const errorEl = document.getElementById("auth-error")!;
            errorEl.textContent = "";
            const username = prompt("Enter your username to sign in with a passkey:");
            if (!username) return;

            try {
                await loginWithPasskey(username);
                navigate("/dashboard");
            } catch (err) {
                errorEl.textContent = (err as Error).message;
            }
        });

        document.getElementById("auth-form")!.addEventListener("submit", async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById("auth-error")!;
            errorEl.textContent = "";

            const email = (document.getElementById("email") as HTMLInputElement).value;
            const password = (document.getElementById("password") as HTMLInputElement).value;

            try {
                let result;
                if (mode === "signup") {
                    const username = (document.getElementById("username") as HTMLInputElement).value;
                    result = await api.signup(email, username, password);
                    setAccessToken(result.access_token);
                    navigate("/passkey-prompt");
                    return;
                } else {
                    result = await api.login(email, password);
                    setAccessToken(result.access_token);
                    navigate("/dashboard");
                }
                setAccessToken(result.access_token);
                navigate("/dashboard");
            } catch (err) {
                errorEl.textContent = (err as Error).message;
            }
        });
    }

    render();
}

// --- WebAuthn passkey login ---
async function loginWithPasskey(username: string) {
    const beginRes = await fetch("/api/webauthn/login/begin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
    });
    if (!beginRes.ok) throw new Error("No passkey found for this user");
    const options = await beginRes.json();

    // Convert base64url challenge/ids to ArrayBuffers for the browser API
    const publicKey = preparePublicKeyOptions(options.publicKey);
    const credential = await navigator.credentials.get({ publicKey });

    const finishRes = await fetch("/api/webauthn/login/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentialToJSON(credential as PublicKeyCredential)),
    });
    if (!finishRes.ok) throw new Error("Passkey authentication failed");

    const result = await finishRes.json();
    setAccessToken(result.access_token);
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
    const padded = base64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(base64url.length + (4 - (base64url.length % 4)) % 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function preparePublicKeyOptions(publicKey: any): PublicKeyCredentialRequestOptions {
    return {
        ...publicKey,
        challenge: base64urlToBuffer(publicKey.challenge),
        allowCredentials: publicKey.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: base64urlToBuffer(cred.id),
        })),
    };
}

function credentialToJSON(credential: PublicKeyCredential) {
    const response = credential.response as AuthenticatorAssertionResponse;
    return {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
            authenticatorData: bufferToBase64url(response.authenticatorData),
            clientDataJSON: bufferToBase64url(response.clientDataJSON),
            signature: bufferToBase64url(response.signature),
            userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
        },
    };
}