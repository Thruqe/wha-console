export function openModal(contentHTML: string, onClose?: () => void): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `<div class="modal">${contentHTML}</div>`;

    document.body.appendChild(overlay);

    function close() {
        overlay.remove();
        document.removeEventListener("keydown", onKeydown);
        onClose?.();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") close();
    }

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });
    document.addEventListener("keydown", onKeydown);

    // expose close via a data attribute hook the caller can use
    (overlay as any).__close = close;

    return overlay;
}

export function closeModal(overlay: HTMLElement) {
    (overlay as any).__close?.();
}