import { openModal, closeModal } from "./modal";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;

    const overlay = openModal(`
      <div class="modal-header">
        <h2>${options.title}</h2>
      </div>
      <div class="modal-body">
        <p style="color: var(--text); font-size: 14px;">${options.message}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="secondary" id="confirm-cancel">Cancel</button>
        <button type="button" class="${options.danger ? "danger" : "primary"}" id="confirm-ok">
          ${options.confirmLabel ?? "Confirm"}
        </button>
      </div>
    `, () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    });

    document.getElementById("confirm-cancel")!.addEventListener("click", () => {
      resolved = true;
      closeModal(overlay);
      resolve(false);
    });

    document.getElementById("confirm-ok")!.addEventListener("click", () => {
      resolved = true;
      closeModal(overlay);
      resolve(true);
    });
  });
}