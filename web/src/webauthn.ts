import { setAccessToken } from "./api";

function base64urlToBuffer(base64url: string): ArrayBuffer {
    const padded = base64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(
        base64url.length + ((4 - (base64url.length % 4)) % 4),
        "="
    );
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

// --- Login with any saved passkey — no username needed ---
export async function loginWithPasskey(): Promise<void> {
    const beginRes = await fetch("/api/webauthn/login/begin", {
        method: "POST",
        credentials: "include",
    });
    if (!beginRes.ok) throw new Error("Could not start passkey login");
    const options = await beginRes.json();

    const publicKey: PublicKeyCredentialRequestOptions = {
        ...options.publicKey,
        challenge: base64urlToBuffer(options.publicKey.challenge),
        allowCredentials: options.publicKey.allowCredentials?.map((c: any) => ({
            ...c,
            id: base64urlToBuffer(c.id),
        })),
    };

    const credential = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;
    if (!credential) throw new Error("Passkey login was cancelled");

    const response = credential.response as AuthenticatorAssertionResponse;
    const finishRes = await fetch("/api/webauthn/login/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            id: credential.id,
            rawId: bufferToBase64url(credential.rawId),
            type: credential.type,
            response: {
                authenticatorData: bufferToBase64url(response.authenticatorData),
                clientDataJSON: bufferToBase64url(response.clientDataJSON),
                signature: bufferToBase64url(response.signature),
                userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
            },
        }),
    });

    if (!finishRes.ok) throw new Error("Passkey authentication failed");
    const result = await finishRes.json();
    setAccessToken(result.access_token);
}

// --- Register a new passkey for the currently logged-in user ---
export async function registerPasskey(): Promise<void> {
    const beginRes = await fetch("/api/webauthn/register/begin", {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });
    if (!beginRes.ok) throw new Error("Could not start passkey registration");
    const options = await beginRes.json();

    const publicKey: PublicKeyCredentialCreationOptions = {
        ...options.publicKey,
        challenge: base64urlToBuffer(options.publicKey.challenge),
        user: {
            ...options.publicKey.user,
            id: base64urlToBuffer(options.publicKey.user.id),
        },
        excludeCredentials: options.publicKey.excludeCredentials?.map((c: any) => ({
            ...c,
            id: base64urlToBuffer(c.id),
        })),
    };

    const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;
    if (!credential) throw new Error("Passkey creation was cancelled");

    const response = credential.response as AuthenticatorAttestationResponse;
    const finishRes = await fetch("/api/webauthn/register/finish", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
            id: credential.id,
            rawId: bufferToBase64url(credential.rawId),
            type: credential.type,
            response: {
                attestationObject: bufferToBase64url(response.attestationObject),
                clientDataJSON: bufferToBase64url(response.clientDataJSON),
            },
        }),
    });

    if (!finishRes.ok) throw new Error("Failed to save passkey");
}