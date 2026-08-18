import { openModal, closeModal } from "./modal";
import { icon, User, X, Mail, LogOut } from "../icons";
import { logout } from "../api";
import { showToast } from "./toast";
import { navigate } from "../router";

export async function openUserSettingsModal() {
  let user = { username: "", email: "", user_id: "", avatar_url: "", github_id: "" };
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });
    if (res.ok) {
      user = await res.json();
    }
  } catch { }

  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${user.avatar_url
      ? `<img src="${user.avatar_url}" alt="${user.username}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />`
      : icon(User, { size: 20 })
    }
        <div>
          <h2>Account Settings</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            Connected GitHub Profile
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="user-modal-close">${icon(X, { size: 18 })}</button>
    </div>

    <form id="user-profile-form">
      <div class="modal-body">
        <div class="field">
          <label for="profile-username">Username</label>
          <div class="input-icon-wrap">
            <span class="icon-left">${icon(User, { size: 16 })}</span>
            <input type="text" id="profile-username" class="has-icon" value="${user.username || ""}" required />
          </div>
        </div>

        <div class="field">
          <label for="profile-email">Email Address</label>
          <div class="input-icon-wrap">
            <span class="icon-left">${icon(Mail, { size: 16 })}</span>
            <input type="email" id="profile-email" class="has-icon" value="${user.email || ""}" disabled style="opacity: 0.7; cursor: not-allowed;" />
          </div>
        </div>

        <p id="user-profile-error" class="error"></p>
      </div>

      <div class="modal-footer" style="justify-content: space-between;">
        <button type="button" class="outline" id="user-modal-logout-btn" style="color: #e5484d; border-color: rgba(229,72,77,0.4);">
          ${icon(LogOut, { size: 14 })} Sign Out
        </button>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="secondary" id="user-modal-cancel">Cancel</button>
          <button type="submit" class="primary">Save Changes</button>
        </div>
      </div>
    </form>
  `);

  document.getElementById("user-modal-close")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("user-modal-cancel")?.addEventListener("click", () => closeModal(overlay));

  document.getElementById("user-modal-logout-btn")?.addEventListener("click", async () => {
    closeModal(overlay);
    await logout();
    navigate("/login");
  });

  document.getElementById("user-profile-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("user-profile-error")!;
    errorEl.textContent = "";

    const username = (document.getElementById("profile-username") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      closeModal(overlay);
      showToast("Account settings updated successfully", "success");
    } catch (err) {
      errorEl.textContent = (err as Error).message;
    }
  });
}