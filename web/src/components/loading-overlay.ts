export function showLoadingOverlay(message: string): () => void {
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = `
    <div class="loading-spinner"></div>
    <p>${message}</p>
  `;
    document.body.appendChild(overlay);

    return () => overlay.remove();
}