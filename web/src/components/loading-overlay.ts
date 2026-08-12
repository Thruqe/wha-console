export function renderSpinner(message: string = "Loading..."): string {
    return `
    <div class="inline-spinner-container">
      <div class="loading-spinner"></div>
      <p class="inline-spinner-text">${message}</p>
    </div>
  `;
}

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